import { SET } from '../actions/visiting-entry';

const defaultState = null;

export default function visitingEntry(state = defaultState, action) {
  switch (action.type) {
    case SET: {
      const { entry } = action.payload;

      return Object.assign({}, entry);
    }
    default:
      return state;
  }
}
