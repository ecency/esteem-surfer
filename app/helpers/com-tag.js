import axios from 'axios';

const cache = {};

export default tag =>
  new Promise((resolve, reject) => {
    if (!tag.startsWith('hive-')) {
      resolve(tag);
    }

    if (cache[tag] !== undefined) {
      resolve(cache[tag]);
      return;
    }

    axios
      .post('https://beta-api.steemit.com', {
        jsonrpc: '2.0',
        method: 'bridge.get_community',
        params: { name: tag, observer: '' },
        id: 1
      })
      .then(resp => {
        if (resp.data.result) {
          const { title } = resp.data.result;
          cache[tag] = title;
          resolve(title);
        }
        return resp;
      })
      .catch(e => reject(e));
  });
