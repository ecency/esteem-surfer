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
    payload: [],
    loading: false
};


export default function posts(state: {} = defaultState, action: postActionType) {
    switch (action.type) {

        default:
            return state;
    }
}

