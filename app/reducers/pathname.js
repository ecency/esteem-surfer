// @flow
import {LOCATION_CHANGE} from 'react-router-redux'


type actionType = {
    type: string,
    +payload?: {}
};

const defaultState = {
    previous: null,
    current: null,
};


export default function pathname(state = defaultState, action: actionType) {
    switch (action.type) {
        case LOCATION_CHANGE:
            return {
                previous: state.currentLocation,
                current: action.payload.pathname,
            };
        default:
            return state
    }
}