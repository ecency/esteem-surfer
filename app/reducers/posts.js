// @flow

import { Record, Map, OrderedMap } from 'immutable';
import { LOCATION_CHANGE } from 'react-router-redux';
import {
  POSTS_FETCH_BEGIN,
  POSTS_FETCH_OK,
  POSTS_FETCH_ERROR,
  POSTS_INVALIDATE
} from '../actions/posts';
import type { postActionType } from './types';
import filters from '../constants/filters.json';
import { makeGroupKeyForPosts } from '../utils/misc';

export const PostGroupRecord = Record({
  entries: OrderedMap({}),
  err: null,
  loading: false
});

const defaultState = Map();

export default function posts(
  state: Map = defaultState,
  action: postActionType
) {
  switch (action.type) {
    case LOCATION_CHANGE: {
      // Create post group when location changed
      const path = action.payload.pathname.split('/');
      if (path.length > 0 && filters.includes(path[1])) {
        const filter = path[1];
        const tag = path[2] || null;

        const groupKey = makeGroupKeyForPosts(filter, tag);
        if (state.get(groupKey) === undefined) {
          return state.set(groupKey, new PostGroupRecord());
        }
      }

      return state;
    }
    case POSTS_FETCH_BEGIN: {
      const groupKey = action.payload.group;

      return state
        .setIn([groupKey, 'err'], null)
        .setIn([groupKey, 'loading'], true);
    }
    case POSTS_FETCH_OK: {
      const groupKey = action.payload.group;
      const newEntries = action.payload.data;

      let newState = state
        .setIn([groupKey, 'err'], null)
        .setIn([groupKey, 'loading'], false);

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
    case POSTS_FETCH_ERROR: {
      const groupKey = action.payload.group;
      return state
        .setIn([groupKey, 'err'], action.payload.error)
        .setIn([groupKey, 'loading'], false);
    }
    case POSTS_INVALIDATE: {
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
