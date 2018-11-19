import {
  FETCH_BEGIN,
  FETCH_OK,
  FETCH_ERROR,
  INVALIDATE
} from '../actions/search-results';

const defaultState = {
  loading: false,
  q: '*',
  sort: 'popularity',
  hits: 0,
  scrollId: null,
  hasMore: true,
  results: []
};

export default function searchResults(state = defaultState, action) {
  switch (action.type) {
    case FETCH_BEGIN: {
      const { q, sort } = action.payload;
      return Object.assign({}, state, { loading: true, q, sort });
    }
    case FETCH_OK: {
      const { data, q, sort } = action.payload;
      const { scroll_id: newScrollId, results: newResults, hits } = data;

      return Object.assign({}, state, {
        scrollId: newScrollId,
        results: [...state.results, ...newResults],
        hits,
        hasMore: newResults.length >= 20,
        loading:false,
        q,
        sort
      });
    }
    case FETCH_ERROR:
      break;
    case INVALIDATE:
      return Object.assign({}, state, { results: [], scrollId: null, hits: 0 });
    default:
      return state;
  }
}