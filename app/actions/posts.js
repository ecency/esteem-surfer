// @flow
import { Client } from 'dsteem';
import { makeGroupKeyForPosts } from '../utils/misc';
import type { postStateType, postActionType } from '../reducers/types';

export const POSTS_FETCH_BEGIN = 'POSTS_FETCH_BEGIN';
export const POSTS_FETCH_OK = 'POSTS_FETCH_OK';
export const POSTS_FETCH_ERROR = 'POSTS_FETCH_ERROR';
export const POSTS_INVALIDATE = 'POSTS_INVALIDATE';
export const POST_SET_READ = 'POST_SET_READ';
export const POST_SET_VOTED = 'POST_SET_VOTED';

const client = new Client('https://api.steemit.com');

export function fetchPosts(
  what,
  tag = '',
  startAuthor = '',
  startPermalink = '',
  limit = 20
) {
  return (
    dispatch: (action: postActionType) => void,
    getState: () => postStateType
  ) => {
    const { posts } = getState(); /* eslint-disable-line */

    const groupKey = makeGroupKeyForPosts(what, tag);

    dispatch({
      type: POSTS_FETCH_BEGIN,
      payload: { group: groupKey }
    });

    // make sure tag is not null or undefined. it should be empty string.
    const query = {
      tag: tag || '',
      start_author: startAuthor,
      start_permalink: startPermalink,
      limit
    };

    client.database
      .getDiscussions(what, query)
      .then(resp => {
        dispatch({
          type: POSTS_FETCH_OK,
          payload: { data: resp, group: groupKey }
        });

        return resp;
      })
      .catch(e => {
        dispatch({
          type: POSTS_FETCH_ERROR,
          payload: { group: groupKey, error: e }
        });
      });
  };
}
