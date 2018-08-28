// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import posts from './posts';
import trendingTags from './trending-tags';
import global from './global';

const rootReducer = combineReducers({
  posts,
  trendingTags,
  global,
  router
});

export default rootReducer;
