import {encryptKey} from '../utils/crypto'
import {setItem} from '../helpers/storage';

export const ACCOUNT_ADDED = 'global/ACCOUNT_ADDED';

export const addAccount = (username, keys) => (dispatch, getState) => {
  const {global} = getState();

  const {pin} = global;

  const eKeys = Object.assign({}, ...Object.keys(keys).map(k => ({[k]: encryptKey(keys[k], pin)})));

  const data = {
    type: 's',
    username,
    keys: eKeys,
    modified: new Date().getTime(),
    lastActive: -1
  };

  setItem(`user_${ username }`, data);

  dispatch(accountAdded(username, data));
};

/* action creators */


export const accountAdded = (username, data) => ({
  type: ACCOUNT_ADDED,
  payload: {username, data}
});