// @flow

import {
  POSTS_FETCH_BEGIN,
  POSTS_FETCH_OK,
  POSTS_FETCH_ERROR,
  POSTS_INVALIDATE
} from '../actions/posts';

import type { postActionType } from './types';

const defaultState = {
  groups: {}
};

export default function posts(
  state: {} = defaultState,
  action: postActionType
) {
  switch (action.type) {
    case POSTS_FETCH_BEGIN: {
      const newState = JSON.parse(JSON.stringify(state));
      const groupKey = action.payload.group;

      if (newState.groups[groupKey] === undefined) {
        newState.groups[groupKey] = {
          data: [],
          err: null,
          loading: true
        };
      } else {
        newState.groups[groupKey].err = null;
        newState.groups[groupKey].loading = true;
      }

      return newState;
    }
    case POSTS_FETCH_OK: {
      const newState = JSON.parse(JSON.stringify(state));
      const groupKey = action.payload.group;

      newState.groups[groupKey].data.push(...action.payload.data);
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
        data: [],
        err: null,
        loading: true
      };
      return newState;
    }
    default:
      return state;
  }
}
