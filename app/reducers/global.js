// @flow

import {LOCATION_CHANGE} from 'react-router-redux'

import filters from '../constants/filters.json'


const defaultState = {
    selectedFilter: 'trending',
    selectedTag: null,
    userTheme: 'light'
};

export default function global(state: {} = defaultState, action: object) {
    switch (action.type) {
        case LOCATION_CHANGE: {
            const path = action.payload.pathname.split('/');
            if (path.length > 0 && filters.includes(path[1])) {
                const filter = path[1];
                const tag = path[2] || null;

                return Object.assign({}, state, {selectedFilter: filter, selectedTag: tag})
            }

            return state;
        }
        default:
            return state;
    }
}

