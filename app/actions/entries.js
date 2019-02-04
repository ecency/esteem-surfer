import {
  getDiscussions,
  getRepliesByLastUpdate
} from '../backend/steem-client';

export const FETCH_BEGIN = 'entries/FETCH_BEGIN';
export const FETCH_OK = 'entries/FETCH_OK';
export const FETCH_ERROR = 'entries/FETCH_ERROR';
export const INVALIDATE = 'entries/INVALIDATE';
export const SET_READ = 'entries/SET_READ';
export const SET_VOTED = 'entries/SET_VOTED';
export const UPDATE_ENTRY = 'entries/UPDATE';

export const makeGroupKeyForEntries = (what, tag = '') => {
  if (tag) {
    return `${what}-${tag}`;
  }
  return `${what}`;
};

export function fetchEntries(what, tag = '', more = false) {
  return (dispatch, getState) => {
    const { entries } = getState();
    const pageSize = 20;

    const groupKey = makeGroupKeyForEntries(what, tag);

    if (!more && entries.getIn([groupKey, 'entries']).size) {
      return;
    }

    const lastEntry = entries
      .getIn([groupKey, 'entries'])
      .valueSeq()
      .last();

    let fn;
    let query;

    if (tag.startsWith('@')) {
      const username = tag.replace('@', '');
      switch (what) {
        case 'feed':
          fn = getDiscussions;
          query = {
            tag: username,
            limit: pageSize,
            start_author: undefined,
            start_permlink: undefined
          };
          break;
        case 'comments':
          fn = getDiscussions;
          query = {
            limit: pageSize,
            start_author: username,
            start_permlink: undefined
          };
          break;
        case 'replies':
          fn = getRepliesByLastUpdate;
          query = {
            start_author: username,
            start_permlink: undefined,
            limit: pageSize
          };
          break;
        default:
          fn = getDiscussions;
          query = {
            tag: username,
            limit: pageSize,
            start_author: undefined,
            start_permlink: undefined
          };
          break;
      }
    } else {
      fn = getDiscussions;
      // make sure tag is not null or undefined. it should be empty string.
      query = {
        tag: tag || '',
        limit: pageSize,
        start_author: undefined,
        start_permlink: undefined
      };
    }

    if (lastEntry) {
      query.start_author = lastEntry.author;
      query.start_permlink = lastEntry.permlink;
    }

    dispatch({
      type: FETCH_BEGIN,
      payload: { group: groupKey }
    });

    const fnArgs = what === 'replies' ? [query] : [what, query];

    fn(...fnArgs)
      .then(resp => {
        dispatch({
          type: FETCH_OK,
          payload: {
            data: resp,
            group: groupKey,
            hasMore: resp.length >= pageSize
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

export function updateEntry(newData) {
  return dispatch => {
    dispatch({
      type: UPDATE_ENTRY,
      payload: { data: newData }
    });
  };
}

export function invalidateEntries(what, tag = '') {
  return dispatch => {
    const groupKey = makeGroupKeyForEntries(what, tag);

    dispatch({
      type: INVALIDATE,
      payload: { group: groupKey }
    });
  };
}
