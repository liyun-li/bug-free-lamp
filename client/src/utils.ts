import { AxiosError, AxiosResponse } from 'axios';

export const alertResponse = (response: AxiosResponse, showResponse: Function) => {
    if (response.data) {
        showResponse(response.data);
    }
}

export const alertError = (error: AxiosError, showResponse: Function) => {
    if (error && error.response) {
        showResponse(error.response.data);
    }
};