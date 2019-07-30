import { encryptKey } from '../utils/crypto';
import { setItem, removeItem, getByPrefix } from '../helpers/storage';

export const ACCOUNT_ADDED = 'accounts/ACCOUNT_ADDED';
export const ACCOUNT_ADDED_SC = 'accounts/ACCOUNT_SC_ADDED';
export const ACCOUNT_UPDATED_SC = 'accounts/ACCOUNT_UPDATED_SC';
export const ACCOUNT_DELETED = 'accounts/ACCOUNT_DELETED';
export const ACCOUNTS_DELETED = 'accounts/ACCOUNTS_DELETED';

export const addAccount = (username, keys) => (dispatch, getState) => {
  const { global } = getState();

  const { pin } = global;

  // key encryption
  const eKeys = Object.assign(
    {},
    ...Object.keys(keys).map(k => ({
      [k]: keys[k] ? encryptKey(keys[k], pin) : null
    }))
  );

  const accountData = {
    type: 's',
    username,
    keys: eKeys
  };

  setItem(`account_${username}`, accountData);
  // setItem(`active_account`, username);
  dispatch(accountAdded(username, accountData));
};

export const addAccountSc = (
  username,
  accessToken,
  refreshToken,
  expiresIn,
  updated = false
) => (dispatch, getState) => {
  const { global } = getState();

  const { pin } = global;

  const accountData = {
    type: 'sc',
    username,
    accessToken: encryptKey(accessToken, pin),
    refreshToken: encryptKey(refreshToken, pin),
    expiresIn
  };

  setItem(`account_${username}`, accountData);
  if (!updated) {
    dispatch(accountAddedSc(username, accountData));
  } else {
    dispatch(accountUpdatedSc(username, accountData));
  }
};

export const deleteAccount = username => dispatch => {
  removeItem(`account_${username}`);

  dispatch(accountDeleted(username));
};

export const deleteAccounts = () => dispatch => {
  getByPrefix('account_').forEach(ac => {
    removeItem(`account_${ac.username}`);
  });

  dispatch(accountsDeleted());
};

/* action creators */

export const accountAdded = username => ({
  type: ACCOUNT_ADDED,
  payload: { username }
});

export const accountAddedSc = username => ({
  type: ACCOUNT_ADDED_SC,
  payload: { username }
});

export const accountUpdatedSc = (username, accountData) => ({
  type: ACCOUNT_UPDATED_SC,
  payload: { username, accountData }
});

export const accountDeleted = username => ({
  type: ACCOUNT_DELETED,
  payload: { username }
});

export const accountsDeleted = () => ({
  type: ACCOUNTS_DELETED,
  payload: {}
});
