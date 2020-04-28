/* eslint-disable */
import activeAccount from './active-account';
import { setItem, removeItem } from '../helpers/storage';

import { ACCOUNT_ADDED, ACCOUNT_DELETED } from '../actions/accounts';

import deepFreeze from 'deep-freeze';

describe('active account reducer', () => {
  let state = undefined;

  it('(1) default state', () => {
    state = activeAccount(state, {});

    expect(state).toMatchSnapshot();
  });
});
