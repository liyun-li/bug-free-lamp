// Hardcoding is fine
export const getServerEndpoint = (): string => {
    const server_dev = 'http://127.0.0.1:3001';
    const server_prod = 'https://x.liyun.li';
    return process.env.NODE_ENV === 'development'
        ? server_dev
        : server_prod;
}