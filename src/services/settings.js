export default (storageService) => {
  return {
    get: (key, def = null) => {
      let val = storageService.get(`app_setting_${ key }`);
      if (val === null) {
        return def;
      }
      return val;
    },
    set: (key, val) => {
      return storageService.set(`app_setting_${ key }`, val);
    },
    hasSettings: () => {
      for (let key in localStorage) {
        if (key.indexOf('app_setting_') === 0) {
          return true;
        }
      }

      return false;
    }
  }
};

