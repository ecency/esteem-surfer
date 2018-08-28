// @flow
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import createHistory from 'history/createMemoryHistory';
import { routerMiddleware } from 'react-router-redux';
import rootReducer from '../reducers';

const history = createHistory();
const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk, router);

function configureStore(initialState?: {}) {
  return createStore(rootReducer, initialState, enhancer);
}

export default { configureStore, history };
