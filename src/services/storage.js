export default () => {
  return {
    get: (key) => {
      let val = localStorage.getItem(key);
      // Parse to json because it is stringify from object.
      return JSON.parse(val);
    },
    set: (key, val) => {
      let val_ = JSON.stringify(val);
      return localStorage.setItem(key, val_);
    },
    remove: (key) => {
      return localStorage.removeItem(key);
    }
  }
};

