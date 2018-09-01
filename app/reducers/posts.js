// @flow

import { LOCATION_CHANGE } from 'react-router-redux';

import {
  POSTS_FETCH_BEGIN,
  POSTS_FETCH_OK,
  POSTS_FETCH_ERROR,
  POSTS_INVALIDATE
} from '../actions/posts';

import type { postActionType } from './types';

import filters from '../constants/filters';
import { makeGroupKeyForPosts } from '../utils/misc';

const defaultState = {
  groups: {}
};

export default function posts(
  state: {} = defaultState,
  action: postActionType
) {
  switch (action.type) {
    case LOCATION_CHANGE: {
      // Create post group when location changed
      const path = action.payload.pathname.split('/');
      if (path.length > 0 && filters.includes(path[1])) {
        const newState = JSON.parse(JSON.stringify(state));

        const filter = path[1];
        const tag = path[2] || null;

        const groupKey = makeGroupKeyForPosts(filter, tag);
        if (newState.groups[groupKey] === undefined) {
          newState.groups[groupKey] = {
            entries: [],
            err: null,
            loading: false
          };
        }

        return newState;
      }

      return state;
    }
    case POSTS_FETCH_BEGIN: {
      const newState = JSON.parse(JSON.stringify(state));
      const groupKey = action.payload.group;

      newState.groups[groupKey].err = null;
      newState.groups[groupKey].loading = true;

      return newState;
    }
    case POSTS_FETCH_OK: {
      const newState = JSON.parse(JSON.stringify(state));
      const groupKey = action.payload.group;
      const { entries } = newState.groups[groupKey];

      const newEntries = action.payload.data.filter(
        x => entries.filter(y => x.id === y.id).length === 0
      );

      newState.groups[groupKey].entries.push(...newEntries);
      newState.groups[groupKey].err = null;
      newState.groups[groupKey].loading = false;

      return newState;
    }
    case POSTS_FETCH_ERROR: {
      const newState = JSON.parse(JSON.stringify(state));
      const groupKey = action.payload.group;

      newState.groups[groupKey].err = action.payload.error;
      newState.groups[groupKey].loading = false;
      return newState;
    }
    case POSTS_INVALIDATE: {
      const newState = JSON.parse(JSON.stringify(state));
      const groupKey = action.payload.group;

      newState.groups[groupKey] = {
        entries: [],
        err: null,
        loading: true
      };
      return newState;
    }
    default:
      return state;
  }
}
