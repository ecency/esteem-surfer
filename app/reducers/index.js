import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import entries from './entries';
import trendingTags from './trending-tags';
import global from './global';
import accounts from './accounts';
import activeAccount from './active-account';
import dynamicProps from './dynamic-props';
import visitingAccount from './visiting-account';
import visitingEntry from './visiting-entry';
import searchResults from './search-results';
import activities from './activities';

const rootReducer = combineReducers({
  entries,
  trendingTags,
  global,
  accounts,
  activeAccount,
  dynamicProps,
  visitingAccount,
  visitingEntry,
  searchResults,
  activities,
  router
});

export default rootReducer;
