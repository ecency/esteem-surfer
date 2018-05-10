
export default (storageService, cryptoService) => {
  return {
    getPinHash: () => {
      return storageService.get(`pin-code-hash`);
    },
    setPin: (v) => {
      const h = cryptoService.md5(v);
      storageService.set(`pin-code-hash`, h);
    },
    removePin: () => {
      storageService.remove(`pin-code-hash`);
    }
  }
};

