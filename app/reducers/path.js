// @flow
import {LOCATION_CHANGE} from 'react-router-redux'


type actionType = {
    type: string,
    +payload?: {}
};

const defaultState = {
    prev: null,
    cur: null,
};


export default function path(state = defaultState, action: actionType) {
    switch (action.type) {
        case LOCATION_CHANGE:
            return {
                prev: state.cur,
                cur: action.payload.pathname,
            };
        default:
            return state
    }
}