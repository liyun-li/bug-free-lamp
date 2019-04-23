import axios from 'axios';

// bad code
const BASE_URL = 'http://127.0.0.1:3001';

export const postRequest = (url: string, data: object) => axios.post(BASE_URL + url, data);