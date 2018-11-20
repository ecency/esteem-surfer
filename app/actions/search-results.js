import { search as searchFn } from '../backend/esteem-client';

export const FETCH_BEGIN = 'search/FETCH_BEGIN';
export const FETCH_OK = 'search/FETCH_OK';
export const FETCH_ERROR = 'search/FETCH_ERROR';
export const RESET_ERROR = 'search/RESET_ERROR';
export const INVALIDATE = 'search/INVALIDATE';

export const makeGroupKeyForResults = (q, sort = '') => {
  if (sort) {
    return `${q}-${sort}`;
  }
  return `${q}`;
};

export function fetchSearchResults(q, sort, more = false) {
  return (dispatch, getState) => {
    const { searchResults } = getState();
    const pageSize = 20;

    const groupKey = makeGroupKeyForResults(q, sort);

    if (!more && searchResults.getIn([groupKey, 'results']).size) {
      return;
    }

    const scrollId = searchResults.getIn([groupKey, 'scrollId']);

    dispatch({
      type: FETCH_BEGIN,
      payload: { group: groupKey }
    });

    searchFn(q, sort, scrollId)
      .then(resp => {
        dispatch({
          type: FETCH_OK,
          payload: {
            group: groupKey,
            data: resp.data.results,
            hits: resp.data.hits,
            hasMore: resp.data.results.length >= pageSize,
            scrollId: resp.data.scroll_id
          }
        });

        return resp;
      })
      .catch(e => {
        dispatch({
          type: FETCH_ERROR,
          payload: { group: groupKey, error: e }
        });
      });
  };
}

export function invalidateSearchResults(q, sort) {
  return dispatch => {
    const groupKey = makeGroupKeyForResults(q, sort);

    dispatch({
      type: INVALIDATE,
      payload: { group: groupKey }
    });
  };
}

export function resetSearchError(q, sort) {
  return dispatch => {
    const groupKey = makeGroupKeyForResults(q, sort);

    dispatch({
      type: RESET_ERROR,
      payload: { group: groupKey }
    });
  };
}
