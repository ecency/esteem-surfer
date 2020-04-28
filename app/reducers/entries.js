import { Record, Map, OrderedMap } from 'immutable';
import { LOCATION_CHANGE } from 'react-router-redux';
import {
  FETCH_BEGIN,
  FETCH_OK,
  FETCH_ERROR,
  INVALIDATE,
  UPDATE_ENTRY,
  makeGroupKeyForEntries
} from '../actions/entries';

import filters from '../constants/filters.json';

export const EntryGroupRecord = Record({
  entries: OrderedMap({}),
  err: null,
  loading: false,
  hasMore: true
});

const defaultState = Map();

export default function entries(state = defaultState, action) {
  switch (action.type) {
    case LOCATION_CHANGE: {
      // Create entry group when location changed
      const path = action.payload.pathname.split('/');
      if (path.length > 0 && filters.includes(path[1])) {
        const filter = path[1];
        const tag = path[2] || null;

        const groupKey = makeGroupKeyForEntries(filter, tag);
        if (state.get(groupKey) === undefined) {
          return state.set(groupKey, new EntryGroupRecord());
        }
      }

      if (path.length >= 1 && path[1].startsWith('@')) {
        const filter = path[2] || 'blog';
        const tag = path[1];

        if (!['blog', 'comments', 'replies', 'feed'].includes(filter)) {
          return state;
        }

        const groupKey = makeGroupKeyForEntries(filter, tag);
        if (state.get(groupKey) === undefined) {
          return state.set(groupKey, new EntryGroupRecord());
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
        if (
          !newState.hasIn([
            groupKey,
            'entries',
            `${entry.author}-${entry.permlink}`
          ])
        ) {
          newState = newState.setIn(
            [groupKey, 'entries', `${entry.author}-${entry.permlink}`],
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
    case UPDATE_ENTRY: {
      const { data } = action.payload;
      let newState = state.asImmutable();

      newState.keySeq().forEach(groupKey => {
        if (
          newState.hasIn([
            groupKey,
            'entries',
            `${data.author}-${data.permlink}`
          ])
        ) {
          newState = newState.setIn(
            [groupKey, 'entries', `${data.author}-${data.permlink}`],
            data
          );
        }
      });

      return newState;
    }
    default:
      return state;
  }
}
