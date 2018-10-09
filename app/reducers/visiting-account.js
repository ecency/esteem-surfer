import { SET } from '../actions/visiting-account';

const defaultState = null;

export default function visitingAccount(state = defaultState, action) {
  switch (action.type) {
    case SET: {
      const { accountData } = action.payload;

      return Object.assign({}, accountData);
    }
    default:
      return state;
  }
}
