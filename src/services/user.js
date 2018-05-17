export default (storageService, cryptoService) => {
  return {
    getAll: () => {

      let l = [];
      for (let key in localStorage) {
        if (key.indexOf('user_') === 0) {
          let v = JSON.parse(localStorage[key]);
          l.push(v)
        }
      }

      return l;
    },
    getActive: () => {
      let activeUserId = storageService.get('active_user');
      if (activeUserId) {
        return storageService.get(`user_${ activeUserId }`);
      }

      return null;
    },
    setActive: (username) => {
      if (username === null) {
        storageService.remove('active_user');
        return;
      }

      // update last active date
      let val = storageService.get(`user_${ username }`);
      val['lastActive'] = new Date().getTime();
      storageService.set(`user_${ username }`, val);

      storageService.set('active_user', username);
    },
    add: (username, keys) => {
      for (let k in keys) {
        if(keys[k]){
          keys[k] = cryptoService.encryptKey(keys[k]);
        }
      }

      let val = {
        'type': 's',
        'username': username,
        'keys': keys,
        'modified': new Date().getTime(),
        'lastActive': -1
      };

      storageService.set(`user_${ username }`, val);
    },
    addSc: (username, token, expiresIn) => {
      token = cryptoService.encryptKey(token);

      let val = {
        'type': 'sc',
        'username': username,
        'token': token,
        'expires': expiresIn,
        'modified': new Date().getTime(),
        'lastActive': -1
      };

      storageService.set(`user_${ username }`, val);
    },
    remove: (username) => {
      storageService.remove(`user_${ username }`);
    }
  }
};

