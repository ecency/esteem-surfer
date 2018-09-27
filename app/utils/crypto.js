import CryptoJS from 'crypto-js';

export const pinHasher = toBeHashed => CryptoJS.MD5(toBeHashed).toString();

export const encryptKey = (k, pin) => CryptoJS.AES.encrypt(k, pin).toString();

export const decryptKey = (k, pin) => CryptoJS.AES.decrypt(k, pin).toString(CryptoJS.enc.Utf8);