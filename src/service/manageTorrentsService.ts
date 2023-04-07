import { Aria2Client } from "../clients/aria2/aria2Client";
import { RealdebridClient } from "../clients/real-debrid/realdebridClient";
import { RealDebridTorrentService } from "./realdebridTorrentService";

export class ManageTorrentService {
    realdebridClient: RealdebridClient;
    aria2Client: Aria2Client;
    currentTorrents: RealDebridTorrentService[] = [];

    constructor(realDebridToken: string, aria2Url: string, aria2Token: string) {
        this.realdebridClient = new RealdebridClient(realDebridToken);
        this.aria2Client = new Aria2Client(aria2Url, aria2Token);
    }

    public async addTorrent(torrentFile: string): Promise<string | null> {
        const torrent = new RealDebridTorrentService(this.realdebridClient, this.aria2Client, torrentFile);
        return torrent.queue().then((res) => {
            this.currentTorrents.push(torrent);
            return res;
        });
    }

    public async update(): Promise<null> {
        this.removeInvalidTorrents();

        return Promise.all(this.currentTorrents.map(torrent => torrent.update())).then(() => Promise.resolve(null))
            .catch(err => {
                console.error('[!] checkWatchList failed', err);
                return Promise.resolve(null);
            });
    }

    private removeInvalidTorrents() {
        this.currentTorrents.forEach((torrent, index) => {
            if (!torrent.isValid) {
                torrent.delete();
                this.currentTorrents.splice(index, 1);
            }
        })
    }

}