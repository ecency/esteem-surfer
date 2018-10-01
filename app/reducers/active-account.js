import {getItem} from "../helpers/storage";

import {
  LOGGED_IN,
  LOGGED_OUT,
  UPDATED
} from '../actions/active-account';


const load = () => {
  const username = getItem('active_account');
  if (username && getItem(`account_${username}`)) {
    return Object.assign({}, getItem(`account_${username}`), {accountData: null})
  }

  return null;
};

const defaultState = load();

export default function activeAccount(state = defaultState, action) {
  switch (action.type) {
    case LOGGED_IN:
    case LOGGED_OUT: {
      return load();
    }
    case UPDATED: {
      const {accountData} = action.payload;
      return Object.assign({}, state, {accountData})
    }
    default:
      return state;
  }
}
