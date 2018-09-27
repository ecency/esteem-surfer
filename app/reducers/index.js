import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import entries from './entries';
import trendingTags from './trending-tags';
import global from './global';
import accounts from './accounts';

const rootReducer = combineReducers({
  entries,
  trendingTags,
  global,
  accounts,
  router
});

export default rootReducer;
