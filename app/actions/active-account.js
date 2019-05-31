/*
eslint-disable camelcase
 */

import { setItem, removeItem } from '../helpers/storage';
import { getAccounts, getAccountRC } from '../backend/steem-client';

import { getPoints } from '../backend/esteem-client';

export const LOGGED_IN = 'active-account/LOGGED_IN';
export const LOGGED_OUT = 'active-account/LOGGED_OUT';
export const UPDATED = 'active-account/UPDATED';

export const logIn = username => (dispatch, getState) => {
  setItem(`active_account`, username);
  dispatch(loggedIn(username));
  update(username, dispatch, getState);
};

export const logOut = () => dispatch => {
  removeItem(`active_account`);
  dispatch(loggedOut());
};

export const updateActiveAccount = () => (dispatch, getState) => {
  const { activeAccount } = getState();
  const { username } = activeAccount;
  update(username, dispatch, getState);
};

const update = (username, dispatch, getState) => {
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
    // Synchronising user's blog for reblog detection causes big amount of data usage. disabled.
    // See components/elements/EntryReblogBtn.js:43
    .then(account => Object.assign({}, account, { blog: [] }))
    .catch(() => {})
    .then(account =>
      getPoints(username).then(p => {
        const o = Object.assign({}, account, {
          unclaimed_points: p.unclaimed_points
        });

        // check active user still same
        const { activeAccount: a } = getState();
        const { username: u } = a;

        if (a && u === username) {
          dispatch(updated(username, o));
        }
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
