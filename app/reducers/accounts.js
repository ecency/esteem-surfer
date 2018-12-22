import { getByPrefix } from '../helpers/storage';

import {
  ACCOUNT_ADDED,
  ACCOUNT_ADDED_SC,
  ACCOUNT_UPDATED_SC,
  ACCOUNT_DELETED,
  ACCOUNTS_DELETED
} from '../actions/accounts';

const defaultState = getByPrefix('account_');

export default function accounts(state = defaultState, action) {
  switch (action.type) {
    case ACCOUNT_ADDED:
    case ACCOUNT_ADDED_SC:
    case ACCOUNT_UPDATED_SC:
    case ACCOUNT_DELETED:
    case ACCOUNTS_DELETED: {
      return getByPrefix('account_');
    }
    default:
      return state;
  }
}
