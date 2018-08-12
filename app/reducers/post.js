// @flow

import {FETCH, FETCH_COMPLETE, FETCH_ERROR, SET_READ, SET_VOTED} from '../actions/post';

import type {postActionType} from './types';

/*
export type actionType = {
    type: string,
    payload?: {},
};
*/

const defaultState = {
    posts: {},
    groups: {}
};


export default function posts(state: {} = defaultState, action: postActionType) {

    let newState, groupKey;

    switch (action.type) {
        case FETCH:

            newState = JSON.parse(JSON.stringify(state));
            groupKey = action.payload.group;

            if (newState.groups[groupKey] === undefined) {
                newState.groups[groupKey] = {
                    ids: [],
                    loading: true
                }
            }

            newState.groups[groupKey].loading = true;

            return newState;
        case FETCH_COMPLETE:

            newState = JSON.parse(JSON.stringify(state));
            groupKey = action.payload.group;

            if (newState.groups[groupKey] === undefined) {
                newState.groups[groupKey] = {
                    ids: [],
                    loading: true
                }
            }

            const data = action.payload.data;

            newState.groups[groupKey].ids = data.map(i => i.id);
            newState.groups[groupKey].loading = false;

            for (let r of data) {
                newState.posts[r.id] = r;
            }

            return newState;
        default:
            return state;
    }
}

