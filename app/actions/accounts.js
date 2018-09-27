import { encryptKey } from '../utils/crypto';
import { setItem, removeItem } from '../helpers/storage';

export const ACCOUNT_ADDED = 'accounts/ACCOUNT_ADDED';
export const ACCOUNT_DELETED = 'accounts/ACCOUNT_DELETED';
export const ACCOUNT_ACTIVATED = 'accounts/ACCOUNT_ACTIVATED';

export const addAccount = (username, keys) => (dispatch, getState) => {
  const { global } = getState();

  const { pin } = global;

  const eKeys = Object.assign(
    {},
    ...Object.keys(keys).map(k => ({ [k]: encryptKey(keys[k], pin) }))
  );

  const accountData = {
    type: 's',
    username,
    keys: eKeys
  };

  setItem(`account_${username}`, accountData);
  setItem(`active_account`, username);
  dispatch(accountAdded(username, accountData));
};

export const deleteAccount = username => (dispatch, getState) => {
  removeItem(`account_${username}`);

  const { accounts } = getState();

  if (accounts.active === username) {
    setItem(`active_account`, null);
  }

  accountDeleted(username);
};

export const activateAccount = username => dispatch => {
  setItem(`active_account`, username);
  dispatch(accountActivated(username));
};

/* action creators */

export const accountAdded = username => ({
  type: ACCOUNT_ADDED,
  payload: { username }
});

export const accountDeleted = username => ({
  type: ACCOUNT_DELETED,
  payload: { username }
});

export const accountActivated = username => ({
  type: ACCOUNT_ACTIVATED,
  payload: { username }
});
