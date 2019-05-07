import { AxiosError, AxiosResponse } from 'axios';
import * as crypto from 'crypto';
import * as NodeRSA from 'node-rsa';
import { encryptionScheme } from './constants';

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

/**
 * Convert a Uint8Array to a hex string.
 * @param intArray a Uint8Array
 */
export const intArray2hex = (intArray: Uint8Array): string => Buffer.from(intArray).toString('hex');

/**
 * Hex string to Buffer
 * @param hexVal a hex string
 */
export const hex2buffer = (hexVal: string): Buffer => Buffer.from(hexVal, 'hex');


/**
 * Convert a hex string to a Uint8Array.
 * @param hexVal a hex string
 */
export const hex2intArray = (hexVal: string): Uint8Array => Uint8Array.from(hex2buffer(hexVal));

/**
 * Encrypt message with AES-GCM, then encrypt the secret with RSA public key.
 * @param plaintext Plaintext
 * @param publicKey Public key
 * @returns A hex string
 */
export const encryptMessage = (plaintext: string, publicKey: string) => {
    const { algorithm, nonceLength, keyLength } = encryptionScheme;

    // Generate a 16-byte nonce.
    const nonce = crypto.randomBytes(nonceLength);

    // Generate a 16-byte key.
    const aesKey = crypto.randomBytes(keyLength);

    // Create the encryption engine.
    const cipher = crypto.createCipheriv(algorithm, aesKey, nonce);

    // Encrypt!
    const encryptedMessage = cipher.update(plaintext, 'utf8', 'hex');
    const remainingMessage = cipher.final('hex');

    // Get authentication tag
    const tag = cipher.getAuthTag();

    // Join nonce, tag and the key
    const secret: Uint8Array = Buffer.concat([nonce, tag, aesKey]);

    // Load public key.
    const rsaKey = new NodeRSA(publicKey, 'public');

    // Encrypt the secret and convert it to a hex string
    const encryptedSecret = intArray2hex(rsaKey.encrypt(secret));

    // Ciphertext = secret + message + most likely nothing.
    return encryptedSecret + encryptedMessage + remainingMessage;
};

/**
 * Decrypt message with RSA secret key, then decrypt the message with decrypted secret.
 * @param ciphertext Ciphertext
 * @param privateKey Private key
 */
export const decryptMessage = (ciphertext: string, privateKey: string) => {
    const { algorithm, nonceLength, tagLength, secretLength } = encryptionScheme;

    // Load RSA private key.
    const rsaKey = new NodeRSA(privateKey);
    const encryptedSecret = ciphertext.substring(0, secretLength);
    const encryptedMessage = ciphertext.substring(secretLength);

    // Deconstruct the secret.
    const secret = rsaKey.decrypt(hex2buffer(encryptedSecret));
    const nonce = secret.slice(0, nonceLength);
    const tag = secret.slice(nonceLength, nonceLength + tagLength);
    const aesKey = secret.slice(nonceLength + tagLength);

    // Create decryption engine.
    const cipher = crypto.createDecipheriv(algorithm, aesKey, nonce);

    // Set the authentication tag for...authentication.
    cipher.setAuthTag(tag);

    // Decrypt!
    const decryptedMessage = cipher.update(encryptedMessage, 'hex', 'utf8');
    const remainingMessage = cipher.final('utf8');

    return decryptedMessage + remainingMessage;
}