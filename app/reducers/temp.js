import { TEMP_SET, TEMP_RESET } from '../actions/temp';

const defaultState = null;

export default function trendingTags(state = defaultState, action) {
  switch (action.type) {
    case TEMP_SET:
      return action.payload;
    case TEMP_RESET:
      return defaultState;
    default:
      return state;
  }
}
