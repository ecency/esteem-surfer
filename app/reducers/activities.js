import { FETCHED, RESET } from '../actions/activities';

const defaultState = {
  unread: 0
};

export default function activities(state = defaultState, action) {
  switch (action.type) {
    case FETCHED: {
      const { unread } = action.payload;

      return Object.assign({}, state, { unread });
    }
    case RESET: {
      return Object.assign({}, defaultState);
    }
    default:
      return state;
  }
}
