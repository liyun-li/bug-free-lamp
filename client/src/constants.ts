export enum routes {
    landing = '/',
    chat = '/chat',
    group = '/group',
    profile = '/profile',
    post = '/post',
    friends = '/contacts'
}

export enum keyCodes {
    enter = 13
}

export enum encryptionScheme {
    algorithm = 'aes-256-gcm',
    nonceLength = 16,
    tagLength = 16,
    keyLength = 32,
    secretLength = 512
}