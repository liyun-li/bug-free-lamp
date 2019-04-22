import axios, { AxiosRequestConfig } from 'axios';

export const request = async (url: string, config: AxiosRequestConfig) =>
    await axios.get(url, config);

export const get = (url: string, config: AxiosRequestConfig) =>
    request(url, {
        ...config,
        method: 'GET'
    });

export const post = (url: string, config: AxiosRequestConfig) =>
    request(url, {
        ...config,
        method: 'POST'
    });