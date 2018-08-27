// @flow
import {Client} from 'dsteem';
import {makeGroupKeyForPosts} from '../utils/misc';
import type {postStateType, postActionType} from '../reducers/types';

export const FETCH = 'FETCH';
export const FETCH_COMPLETE = 'FETCH_COMPLETE';
export const FETCH_ERROR = 'FETCH_ERROR';
export const SET_READ = 'SET_CONTENT_READ';
export const SET_VOTED = 'SET_CONTENT_VOTED';

const client = new Client('https://api.steemit.com');

export function fetchPosts(what, tag = '', startAuthor = '', startPermalink = '', limit = 20) {
    return (dispatch: (action: postActionType) => void,
            getState: () => postStateType) => {
        const {post} = getState();

        const groupKey = makeGroupKeyForPosts(what, tag);

        if (post.groups[groupKey] !== undefined) {
            return
        }

        dispatch({
            type: FETCH,
            payload: {group: groupKey},
        });

        // make sure tag is not null or undefined. it should be empty string.
        const query = {tag: (tag || ''), start_author: startAuthor, start_permalink: startPermalink, limit};

        client.database.getDiscussions(what, query).then((resp) => {
            dispatch({
                type: FETCH_COMPLETE,
                payload: {data: resp, group: groupKey}
            });

            return resp
        }).catch(() => {
            dispatch({
                type: FETCH_ERROR,
                payload: {group: groupKey},
            });
        })
    };
}