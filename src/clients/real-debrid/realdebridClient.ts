import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import { FSWatcher } from 'chokidar';
import { readFileSync } from "fs";
import { AbstractClient } from '../abstractClient';

export class RealdebridClient extends AbstractClient {

    constructor(token: string, baseURL: string = 'https://api.real-debrid.com/rest/1.0') {
        super(baseURL);
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    public unrestrictLink = (link: string): Promise<UnrestrictLinkResponse> => {
        const form: FormData = new FormData();
        form.append("link", link);

        const config: AxiosRequestConfig = {
            method: "POST",
            url: "/unrestrict/link",
            headers: { 'Content-Type': 'multipart/form-data' },
            data: form
        };

        return this.call<UnrestrictLinkResponse>(config);
    }

    public getTorrentInfo = (torrentId: string): Promise<TorrentInfo> => {
        const config: AxiosRequestConfig = {
            method: "GET",
            url: `/torrents/info/${torrentId}`
        };

        return this.call<TorrentInfo>(config)
    }

    public deleteTorrent = (torrentId: string): Promise<null> => {
        const config: AxiosRequestConfig = {
            method: "DELETE",
            url: `/torrents/delete/${torrentId}`
        };

        return this.call<null>(config)
    }

    public selectTorrentFiles = (torrentId: string): Promise<null> => {
        const form: FormData = new FormData();
        form.append("files", "all");

        const config: AxiosRequestConfig = {
            method: "POST",
            url: `/torrents/selectFiles/${torrentId}`,
            headers: { 'Content-Type': 'multipart/form-data' },
            data: form
        };

        return this.call<null>(config);
    }

    public addMagnet = (magnetFile: string): Promise<string> => {
        const magnet = readFileSync(magnetFile, 'utf-8');
        const form: FormData = new FormData();
        form.append("magnet", magnet);

        const config: AxiosRequestConfig = {
            method: "POST",
            url: "/torrents/addMagnet",
            headers: { 'Content-Type': 'multipart/form-data' },
            data: form
        };

        return this.call<AddTorrentResponse>(config).then(response => response.id);
    }

    public addTorrent = (torrentFile: string): Promise<string> => {

        const config: AxiosRequestConfig = {
            method: "PUT",
            url: "/torrents/addTorrent",
            headers: { 'Content-Type': 'multipart/form-data' },
            data: readFileSync(torrentFile)
        };

        return this.call<AddTorrentResponse>(config).then(response => response.id);
    }

}