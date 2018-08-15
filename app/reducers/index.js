// @flow
import {combineReducers} from 'redux';
import {routerReducer as router} from 'react-router-redux';
import counter from './counter';
import post from './post';
import trendingTags from './trending-tags'
import pathname from './pathname';

const rootReducer = combineReducers({
    counter,
    post,
    trendingTags,
    pathname,
    router
});

export default rootReducer;
