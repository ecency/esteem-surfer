import {getByPrefix, getItem} from '../helpers/storage';

import {
  ACCOUNT_ADDED,
  ACCOUNT_DELETED,
  ACCOUNT_ACTIVATED,
  ACCOUNT_ADDED_SC
} from '../actions/accounts';

const defaultState = {
  active: getItem('active_account'),
  list: getByPrefix('account_')
};

export default function accounts(state = defaultState, action) {
  switch (action.type) {
    case ACCOUNT_ADDED:
    case ACCOUNT_ADDED_SC:
    case ACCOUNT_DELETED:
    case ACCOUNT_ACTIVATED: {
      return {
        active: getItem('active_account'),
        list: getByPrefix('account_')
      };
    }
    default:
      return state;
  }
}
