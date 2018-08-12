// @flow
import {combineReducers} from 'redux';
import {routerReducer as router} from 'react-router-redux';
import counter from './counter';
import post from './post';

const rootReducer = combineReducers({
    counter,
    post,
    router
});

export default rootReducer;
