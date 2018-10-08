import { SET } from '../actions/visiting-profile';

const defaultState = null;

export default function visitingProfile(state = defaultState, action) {
  switch (action.type) {
    case SET: {
      const { accountData } = action.payload;

      return Object.assign({}, accountData);
    }
    default:
      return state;
  }
}
