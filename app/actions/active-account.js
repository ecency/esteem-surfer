/*
eslint-disable camelcase
 */

import { setItem, removeItem } from '../helpers/storage';
import {
  getAccounts,
  getAccountRC,
  getDiscussions
} from '../backend/steem-client';

import { getPoints } from '../backend/esteem-client';

export const LOGGED_IN = 'active-account/LOGGED_IN';
export const LOGGED_OUT = 'active-account/LOGGED_OUT';
export const UPDATED = 'active-account/UPDATED';

export const logIn = username => dispatch => {
  setItem(`active_account`, username);
  dispatch(loggedIn(username));

  getAccounts([username])
    .then(resp => {
      const account = resp[0];

      return getAccountRC(username).then(r => {
        if (r.rc_accounts && r.rc_accounts.length > 0) {
          return Object.assign({}, account, { rcAccount: r.rc_accounts[0] });
        }

        return account;
      });
    })
    .then(account =>
      getDiscussions('blog', {
        tag: username,
        limit: 40,
        start_author: undefined,
        start_permlink: undefined
      }).then(blog => Object.assign({}, account, { blog }))
    )
    .then(resp => {
      dispatch(updated(username, resp));
      return resp;
    })
    .catch(() => {});
};

export const logOut = () => dispatch => {
  removeItem(`active_account`);
  dispatch(loggedOut());
};

export const updateActiveAccount = () => (dispatch, getState) => {
  const { activeAccount } = getState();
  const { username } = activeAccount;

  getAccounts([username])
    .then(resp => {
      const account = resp[0];

      return getAccountRC(username).then(r => {
        if (r.rc_accounts && r.rc_accounts.length > 0) {
          return Object.assign({}, account, { rcAccount: r.rc_accounts[0] });
        }

        return account;
      });
    })
    .then(account =>
      getDiscussions('blog', {
        tag: username,
        limit: 40,
        start_author: undefined,
        start_permlink: undefined
      }).then(blog => Object.assign({}, account, { blog }))
    )
    .then(resp => {
      dispatch(updated(username, resp));
      return resp;
    })
    .catch(() => {})
    .then(account =>
      getPoints(username).then(p => {
        const o = Object.assign({}, account, {
          unclaimed_points: p.unclaimed_points
        });
        dispatch(updated(username, o));
        return o;
      })
    )
    .catch(() => {});
};

export const loggedIn = username => ({
  type: LOGGED_IN,
  payload: { username }
});

export const loggedOut = () => ({
  type: LOGGED_OUT,
  payload: {}
});

export const updated = (username, accountData) => ({
  type: UPDATED,
  payload: { username, accountData }
});
