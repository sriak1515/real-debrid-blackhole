import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AbstractClient } from "../abstractClient";

export class Aria2Client extends AbstractClient {
    token: string;
    id: number;

    constructor(baseURL: string, token: string) {
        super(baseURL);
        this.token = token;
        this.id = 0;
    }

    public async addUri(uri: string) : Promise<null> {
        const config: AxiosRequestConfig = {
            method: "POST",
            data: {
                jsonrpc: '2.0',
                method: 'aria2.addUri',
                params: [`token:${this.token}`, [uri]],
                id: this.id++
            }
        };
        return await this.call<null>(config);
    }
}