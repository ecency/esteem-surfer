import { getByPrefix, getItem } from '../helpers/storage';

import {
  ACCOUNT_ADDED,
  ACCOUNT_DELETED,
  ACCOUNT_ACTIVATED,
  ACCOUNT_ADDED_SC,
  ACCOUNT_DEACTIVATED,
  ACTIVE_ACCOUNT_DATA_UPDATED
} from '../actions/accounts';

const defaultState = {
  activeAccount: getItem('active_account')
    ? Object.assign(
        {},
        { accountData: null },
        getByPrefix('account_').filter(
          i => i.username === getItem('active_account')
        )[0]
      )
    : null,
  list: getByPrefix('account_')
};

export default function accounts(state = defaultState, action) {
  switch (action.type) {
    case ACCOUNT_ADDED:
    case ACCOUNT_ADDED_SC:
    case ACCOUNT_DELETED:
    case ACCOUNT_ACTIVATED:
    case ACCOUNT_DEACTIVATED: {
      return {
        activeAccount: getItem('active_account')
          ? Object.assign(
              {},
              { accountData: null },
              getByPrefix('account_').filter(
                i => i.username === getItem('active_account')
              )[0]
            )
          : null,
        list: getByPrefix('account_')
      };
    }
    case ACTIVE_ACCOUNT_DATA_UPDATED: {
      const { accountData } = action.payload;
      return {
        activeAccount: Object.assign(
          {},
          { accountData },
          getByPrefix('account_').filter(
            i => i.username === getItem('active_account')
          )[0]
        ),
        list: getByPrefix('account_')
      };
    }
    default:
      return state;
  }
}
