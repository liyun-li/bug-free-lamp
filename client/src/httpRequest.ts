import axios from 'axios';

axios.defaults.withCredentials = true;

// bad code
export const SERVER_URL = 'https://bug.free.lamp:3001';

export const postRequest = (url: string, data?: object) =>
    axios({
        method: 'POST',
        url: SERVER_URL + url,
        data: data || {}
    });

export const getRequest = (url: string, data?: object) =>
    axios({
        method: 'GET',
        url: SERVER_URL + url,
        data: data || {}
    });