import CryptoJS from 'crypto-js';

export default ($rootScope) => {
  return {
    md5: (i) => {
      return CryptoJS.MD5(i).toString();
    },
    encryptKey: (k) => {
      return CryptoJS.AES.encrypt(k, $rootScope.getPinCode()).toString();
    },
    decryptKey: (k) => {
      const a = CryptoJS.AES.decrypt(k, $rootScope.getPinCode()).toString(CryptoJS.enc.Utf8);
      return a
    }
  }
};

