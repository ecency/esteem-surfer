// @flow

import { Record, Map, OrderedMap } from 'immutable';
import { LOCATION_CHANGE } from 'react-router-redux';
import {
  FETCH_BEGIN,
  FETCH_OK,
  FETCH_ERROR,
  INVALIDATE,
  makeGroupKeyForEntries
} from '../actions/entries';
import type { commonActionType } from './types';
import filters from '../constants/filters.json';

export const PostGroupRecord = Record({
  entries: OrderedMap({}),
  err: null,
  loading: false,
  hasMore: true
});

const defaultState = Map();

export default function posts(
  state: Map = defaultState,
  action: commonActionType
) {
  switch (action.type) {
    case LOCATION_CHANGE: {
      // Create post group when location changed
      const path = action.payload.pathname.split('/');
      if (path.length > 0 && filters.includes(path[1])) {
        const filter = path[1];
        const tag = path[2] || null;

        const groupKey = makeGroupKeyForEntries(filter, tag);
        if (state.get(groupKey) === undefined) {
          return state.set(groupKey, new PostGroupRecord());
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
      const { group: groupKey, data: newEntries, hasMore } = action.payload;

      let newState = state
        .setIn([groupKey, 'err'], null)
        .setIn([groupKey, 'loading'], false)
        .setIn([groupKey, 'hasMore'], hasMore);

      newEntries.forEach(entry => {
        if (!newState.hasIn([groupKey, 'entries', `${entry.id}`])) {
          newState = newState.setIn(
            [groupKey, 'entries', `${entry.id}`],
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
    case INVALIDATE: {
      const groupKey = action.payload.group;
      return state
        .setIn([groupKey, 'entries'], OrderedMap({}))
        .setIn([groupKey, 'err'], null)
        .setIn([groupKey, 'loading'], false);
    }
    default:
      return state;
  }
}
