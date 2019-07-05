import { getPromotedPosts } from '../backend/esteem-client';
import { getContent } from '../backend/steem-client';

export const FETCH_BEGIN = 'promoted-entries/FETCH_BEGIN';
export const FETCH_OK = 'promoted-entries/FETCH_OK';
export const FETCH_ERROR = 'promoted-entries/FETCH_ERROR';

export function fetchPromotedEntries() {
  return dispatch => {
    dispatch({
      type: FETCH_BEGIN
    });

    getPromotedPosts()
      .then(resp => {
        const prms = resp.map(x => getContent(x.author, x.permlink));
        return Promise.all(prms);
      })
      .then(resp => {
        dispatch({
          type: FETCH_OK,
          payload: {
            data: resp
          }
        });

        return resp;
      })
      .catch(() => {
        dispatch({
          type: FETCH_ERROR
        });
      });
  };
}
