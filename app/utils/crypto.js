import CryptoJS from 'crypto-js';

export const pinHasher = toBeHashed => CryptoJS.MD5(toBeHashed).toString();

export const encryptKey = (k, pin) => CryptoJS.AES.encrypt(k, pin).toString();

export const decryptKey = (k, pin) => {
  const kkey = k.owner || k.active || k.posting || k.memo || k;
  return CryptoJS.AES.decrypt(kkey, pin).toString(CryptoJS.enc.Utf8);
};
