import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import axiosRetry, { exponentialDelay, isNetworkOrIdempotentRequestError } from 'axios-retry';

export abstract class AbstractClient {
  client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL: baseURL,
      timeout: 5000
    });

    axiosRetry(this.client, {
      retryDelay: exponentialDelay, retries: 5, retryCondition: e => {
        if (e.response !== undefined) {
          return e.response.status >= 400;
        }
        return isNetworkOrIdempotentRequestError(e);
      }
    });
  }

  protected async call<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client(config);
      if (response.status > 400) {
        return Promise.reject(new Error(response.statusText));
      }
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

}