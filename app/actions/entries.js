// @flow
import { Client } from 'dsteem';
import type { postStateType, commonActionType } from '../reducers/types';

export const FETCH_BEGIN = 'entries/FETCH_BEGIN';
export const FETCH_OK = 'entries/FETCH_OK';
export const FETCH_ERROR = 'entries/FETCH_ERROR';
export const INVALIDATE = 'entries/INVALIDATE';
export const SET_READ = 'entries/SET_READ';
export const SET_VOTED = 'entries/SET_VOTED';

const client = new Client('https://api.steemit.com');

export const makeGroupKeyForEntries = (
  what: string,
  tag: string = null
): string => {
  if (tag) {
    return `${what}-${tag}`;
  }
  return `${what}`;
};

export function fetchEntries(
  what: string,
  tag: string | null = '',
  more: boolean = false
) {
  return (
    dispatch: (action: commonActionType) => void,
    getState: () => postStateType
  ) => {
    const { entries } = getState();
    const pageSize = 20;

    const groupKey = makeGroupKeyForEntries(what, tag);

    // make sure tag is not null or undefined. it should be empty string.
    const query = {
      tag: tag || '',
      limit: pageSize
    };

    if (!more && entries.getIn([groupKey, 'entries']).size) {
      return;
    }

    const lastEntry = entries
      .getIn([groupKey, 'entries'])
      .valueSeq()
      .last();

    if (lastEntry) {
      query.start_author = lastEntry.author;
      query.start_permlink = lastEntry.permlink;
    }

    dispatch({
      type: FETCH_BEGIN,
      payload: { group: groupKey }
    });

    client.database
      .getDiscussions(what, query)
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

export function invalidateEntries(what, tag = '') {
  return (dispatch: (action: commonActionType) => void) => {
    const groupKey = makeGroupKeyForEntries(what, tag);

    dispatch({
      type: INVALIDATE,
      payload: { group: groupKey }
    });
  };
}
