// @flow
import {combineReducers} from 'redux';
import {routerReducer as router} from 'react-router-redux';
import post from './post';
import trendingTags from './trending-tags'
import pathname from './pathname';
import global from './global'

const rootReducer = combineReducers({
    post,
    trendingTags,
    pathname,
    global,
    router
});

export default rootReducer;
