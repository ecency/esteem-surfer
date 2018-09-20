import {
  TT_FETCH_BEGIN,
  TT_FETCH_OK,
  TT_FETCH_ERROR
} from '../actions/trending-tags';

const defaultState = {
  list: [],
  loading: false,
  error: false
};

export default function trendingTags(state = defaultState, action) {
  switch (action.type) {
    case TT_FETCH_BEGIN:
      return {
        list: [],
        loading: true,
        error: false
      };
    case TT_FETCH_OK:
      return {
        list: action.payload.filter(x => x.name !== '').map(x => x.name),
        loading: false,
        error: false
      };
    case TT_FETCH_ERROR:
      return {
        list: [],
        loading: false,
        error: true
      };
    default:
      return state;
  }
}
