import CryptoJS from 'crypto-js';

export default toBeHashed => CryptoJS.MD5(toBeHashed).toString();
