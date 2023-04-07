import { unlinkSync } from "fs"
import { Aria2Client } from "../clients/aria2/aria2Client";
import { RealdebridClient } from "../clients/real-debrid/realdebridClient";

export class RealDebridTorrentService {
    realdebridClient: RealdebridClient;
    aria2Client: Aria2Client;
    torrentFile: string;
    id?: string;
    remoteStatus: TorrentStatus | null = null;
    isValid: boolean = true;

    constructor(realdebridClient: RealdebridClient, aria2Client: Aria2Client, torrentFile: string) {
        this.realdebridClient = realdebridClient;
        this.aria2Client = aria2Client;
        this.torrentFile = torrentFile;
    }

    public async queue(): Promise<string | null> {
        var queueFunction: (torrentFile: string) => Promise<string>;
        if (this.torrentFile.endsWith('.torrent')) {
            queueFunction = this.realdebridClient.addTorrent
        } else if (this.torrentFile.endsWith('.magnet')) {
            queueFunction = this.realdebridClient.addMagnet
        } else {
            console.log(`[+] '${this.torrentFile}' has an unsupported extension.`)
            return Promise.resolve(null);
        }
        return queueFunction(this.torrentFile).then(id => {
            this.id = id;
            return this.realdebridClient.getTorrentInfo(id).then(torrentInfo => {
                if (torrentInfo.status === 'waiting_files_selection') {
                    return this.realdebridClient.selectTorrentFiles(id).catch(() => {
                        this.isValid = false;
                        console.log(`[+] error select files for '${this.torrentFile}.`);
                        return Promise.resolve(null);
                    });
                }
                return Promise.resolve(null);
            });
        }).catch((err) => {
            console.debug(err);
            this.isValid = false;
            console.log(`[+] error queuing '${this.torrentFile}.`);
            return Promise.resolve(null);
        });
    }

    public async update(): Promise<boolean> {
        if (this.id === undefined) {
            console.log(`[+] could not update '${this.torrentFile}' because it is not queued.`);
            this.isValid = false;
            return Promise.resolve(false);
        }
        return this.realdebridClient.getTorrentInfo(this.id).then(torrentInfo => {
            console.log(`[+] '${this.torrentFile}' id: ${this.id} remote: ${torrentInfo.status} progress: ${torrentInfo.progress}%`)
            this.remoteStatus = torrentInfo.status;
            if (!this.isValidStatus(torrentInfo.status)) {
                console.log(`[+] error with '${this.torrentFile}, status is '${torrentInfo.status}'.`);
                this.isValid = false;
                return Promise.resolve(false);
            }
            if (this.isDoneStatus(torrentInfo.status)) {
                const promises = torrentInfo.links.map(link => this.unrestrictAndDownload(link));
                this.isValid = false;
                return Promise.all(promises).then(() => Promise.resolve(false)).catch(() => Promise.resolve(false));
            }
            return Promise.resolve(true);
        })
    }

    public async delete(): Promise<null> {
        console.log(`[+] removing torrent file '${this.torrentFile}'`);
        unlinkSync(this.torrentFile);
        if (this.id !== undefined) {
            return this.realdebridClient.deleteTorrent(this.id).catch(() => {
                console.log(`[+] error removing torrent '${this.torrentFile}' on real-debrid`);
                return Promise.resolve(null);
            });
        }
        return Promise.resolve(null);
    }

    private async unrestrictAndDownload(link: string): Promise<null> {
        return this.realdebridClient.unrestrictLink(link).then((unrestrictResponse) => {
            console.log(`[+] Passing link to aria2 for '${this.torrentFile}'`);
            return this.aria2Client.addUri(unrestrictResponse.download).catch(() => {
                this.isValid = false;
                console.log(`[+] error passing link '${unrestrictResponse.download}' to aria2 for '${this.torrentFile}'`);
                return Promise.resolve(null);
            });
        }).catch(() => {
            this.isValid = false;
            console.log(`[+] error unrestricting link '${link}' for '${this.torrentFile}'`);
            return Promise.resolve(null);
        });
    }

    private isValidStatus(state: TorrentStatus): boolean {
        return (state === "waiting_files_selection" ||
            state === "queued" ||
            state === "downloading" ||
            state === "downloaded" ||
            state === "compressing" ||
            state === "uploading");
    }

    private isDoneStatus(state: TorrentStatus): boolean {
        return (state === "downloaded");
    }
}