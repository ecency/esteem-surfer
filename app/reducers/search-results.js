import { Record, Map, OrderedMap } from 'immutable';
import { LOCATION_CHANGE } from 'react-router-redux';
import {
  FETCH_BEGIN,
  FETCH_OK,
  FETCH_ERROR,
  RESET_ERROR,
  INVALIDATE,
  makeGroupKeyForResults
} from '../actions/search-results';

import { searchSort } from '../constants/defaults';

import qsParse from '../utils/qs';

export const ResultGroupRecord = Record({
  results: OrderedMap({}),
  err: null,
  loading: false,
  hasMore: true,
  hits: 0,
  scrollId: null
});

const defaultState = Map();

export default function searchResults(state = defaultState, action) {
  switch (action.type) {
    case LOCATION_CHANGE: {
      const { pathname: path } = action.payload;
      const { search } = action.payload;

      const qs = qsParse(search);
      const { q, sort = searchSort } = qs;
      const groupKey = makeGroupKeyForResults(q, sort);

      if (path.startsWith('/search') && q) {
        if (state.get(groupKey) === undefined) {
          return state.set(groupKey, new ResultGroupRecord());
        }
      }

      return state;
    }
    case FETCH_BEGIN: {
      const groupKey = action.payload.group;

      return state
        .setIn([groupKey, 'err'], null)
        .setIn([groupKey, 'loading'], true);
    }
    case FETCH_OK: {
      const {
        group: groupKey,
        data: newEntries,
        hits,
        hasMore,
        scrollId
      } = action.payload;

      let newState = state
        .setIn([groupKey, 'err'], null)
        .setIn([groupKey, 'loading'], false)
        .setIn([groupKey, 'hits'], hits)
        .setIn([groupKey, 'hasMore'], hasMore)
        .setIn([groupKey, 'scrollId'], scrollId);

      newEntries.forEach(entry => {
        if (
          !newState.hasIn([
            groupKey,
            'results',
            `${entry.author}-${entry.permlink}`
          ])
        ) {
          newState = newState.setIn(
            [groupKey, 'results', `${entry.author}-${entry.permlink}`],
            entry
          );
        }
      });

      return newState;
    }
    case FETCH_ERROR: {
      const groupKey = action.payload.group;
      return state
        .setIn([groupKey, 'err'], action.payload.error)
        .setIn([groupKey, 'loading'], false);
    }
    case RESET_ERROR: {
      const groupKey = action.payload.group;
      return state.setIn([groupKey, 'err'], null);
    }
    case INVALIDATE: {
      const groupKey = action.payload.group;
      return state.set(groupKey, new ResultGroupRecord());
    }
    default:
      return state;
  }
}
