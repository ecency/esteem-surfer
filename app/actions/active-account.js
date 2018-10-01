import {setItem, removeItem} from "../helpers/storage";
import {getAccounts} from '../backend/steem-client';

export const LOGGED_IN = 'active-account/LOGGED_IN';
export const LOGGED_OUT = 'active-account/LOGGED_OUT';
export const UPDATED = 'active-account/UPDATED';

export const logIn = username => dispatch => {
  setItem(`active_account`, username);
  dispatch(loggedIn(username));

  getAccounts([username])
    .then(resp => resp[0])
    .then(resp => {
      dispatch(updated(username, resp));
      return resp;
    })
    .catch(() => {
    });
};

export const logOut = () => dispatch => {
  removeItem(`active_account`);
  dispatch(loggedOut());
};

export const updateActiveAccount = () => (dispatch, getState) => {
  const {activeAccount} = getState();
  const {username} = activeAccount;

  getAccounts([username])
    .then(resp => resp[0])
    .then(resp => {
      dispatch(updated(username, resp));
      return resp;
    })
    .catch(() => {
    });
};

export const loggedIn = username => ({
  type: LOGGED_IN,
  payload: {username}
});

export const loggedOut = () => ({
  type: LOGGED_OUT,
  payload: {}
});

export const updated = (username, accountData) => ({
  type: UPDATED,
  payload: {username, accountData}
});