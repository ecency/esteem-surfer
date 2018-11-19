import { search as searchFn } from '../backend/esteem-client';


export const FETCH_BEGIN = 'search/FETCH_BEGIN';
export const FETCH_OK = 'search/FETCH_OK';
export const FETCH_ERROR = 'search/FETCH_ERROR';
export const INVALIDATE = 'search/INVALIDATE';


export function fetchSearchResults(q, sort, more = false) {
  return (dispatch, getState) => {

    const { searchResults } = getState();
    const { results, scrollId } = searchResults;

    if (!more && results.length) {
      return;
    }

    dispatch({
      type: FETCH_BEGIN,
      payload: {
        q,
        sort
      }
    });

    searchFn(q, sort, scrollId)
      .then(resp => {

        dispatch({
          type: FETCH_OK,
          payload: {
            q,
            sort,
            data: resp.data
          }
        });

        return resp;
      })
      .catch((e) => {
        console.log(e);
        dispatch({
          type: FETCH_ERROR
        });
      });
  };
}


export function invalidateSearchResults() {
  return (dispatch) => {
    dispatch({
      type: INVALIDATE
    });
  };
}