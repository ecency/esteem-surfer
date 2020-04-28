import axios from 'axios';
import { server } from '../constants/defaults';

const cache = {};
const patt = /hive-\d\w+/g;

export default tag =>
  new Promise((resolve, reject) => {
    const mm = tag.match(patt);
    if (mm && mm.length > 0) {
      if (cache[tag] !== undefined) {
        resolve(cache[tag]);
        return;
      }

      axios
        .post(server, {
          jsonrpc: '2.0',
          method: 'bridge.list_communities',
          params: {},
          id: 1
        })
        .then(resp => {
          if (resp.data.result) {
            for (let i = 0; i < resp.data.result.length; i += 1) {
              const { name, title } = resp.data.result[i];
              cache[name] = title;
            }
            resolve(cache[tag]);
          }
          return resp;
        })
        .catch(e => reject(e));
    } else {
      resolve(tag);
    }
  });
