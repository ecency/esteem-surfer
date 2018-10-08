import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import entries from './entries';
import trendingTags from './trending-tags';
import global from './global';
import accounts from './accounts';
import activeAccount from './active-account';
import dynamicProps from './dynamic-props';
import visitingProfile from './visiting-profile';

const rootReducer = combineReducers({
  entries,
  trendingTags,
  global,
  accounts,
  activeAccount,
  dynamicProps,
  visitingProfile,
  router
});

export default rootReducer;
