// @flow
import {Client} from 'dsteem';

const client = new Client('https://api.steemit.com');

import type {postStateType, postActionType} from '../reducers/types';

/*
type actionType = {
    type: string,
    payload?: {},
};
*/

export const FETCH = 'FETCH';
export const FETCH_COMPLETE = 'FETCH_COMPLETE';
export const FETCH_ERROR = 'FETCH_ERROR';
export const SET_READ = 'SET_CONTENT_READ';
export const SET_VOTED = 'SET_CONTENT_VOTED';


export function fetchPosts(what, tag, startAuthor, startPermalink, limit = 20) {
    return (dispatch: (action: actionType) => void,
            getState: () => postStateType) => {
        const {content} = getState();

        dispatch({
            type: FETCH
        });

        client.database.getDiscussions().then((discussions) => {
            console.log(discussions)
        }).catch((err) => {
            dispatch({
                type: FETCH_ERROR
            });
        })
    };
}
