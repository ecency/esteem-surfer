import { FETCHED } from '../actions/market-data';

const defaultState = null;

export default function marketData(state = defaultState, action) {
  switch (action.type) {
    case FETCHED: {
      const { payload: data } = action;
      return data;
    }
    default:
      return state;
  }
}
