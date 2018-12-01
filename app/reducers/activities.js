import { FETCHED, RESET } from '../actions/activities';

const defaultState = {
  unread: 0,
  list: []
};

export default function activities(state = defaultState, action) {
  switch (action.type) {
    case FETCHED: {
      const { unread, list } = action.payload;

      return Object.assign({}, state, { unread, list });
    }
    case RESET: {
      return Object.assign({}, defaultState);
    }
    default:
      return state;
  }
}
