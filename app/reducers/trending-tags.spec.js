/* eslint-disable */
import trendingTags from './trending-tags';
import {
  TT_FETCH_BEGIN,
  TT_FETCH_OK,
  TT_FETCH_ERROR
} from '../actions/trending-tags';

import deepFreeze from 'deep-freeze';

describe('reducers', () => {
  describe('trending-tags', () => {
    it('should handle initial state', () => {
      expect(trendingTags(undefined, {})).toMatchSnapshot();
    });

    it('should handle TT_FETCH_BEGIN', () => {
      const stateBefore = {};

      deepFreeze(stateBefore);

      const action = {
        type: TT_FETCH_BEGIN
      };

      const stateAfter = {
        list: [],
        loading: true,
        error: false
      };

      const res = trendingTags(stateBefore, action);

      expect(res).toEqual(stateAfter);
    });

    it('should handle TT_FETCH_OK', () => {
      const stateBefore = {
        list: [],
        loading: true,
        error: false
      };

      deepFreeze(stateBefore);

      const action = {
        type: TT_FETCH_OK,
        payload: [
          { name: '' },
          { name: 'life' },
          { name: 'kr' },
          { name: 'steemit' },
          { name: 'art' }
        ]
      };

      const stateAfter = {
        list: ['life', 'kr', 'steemit', 'art'],
        loading: false,
        error: false
      };

      const res = trendingTags(stateBefore, action);

      expect(res).toEqual(stateAfter);
    });

    it('should handle TT_FETCH_ERROR', () => {
      const stateBefore = {
        list: ['life', 'kr', 'steemit', 'art'],
        loading: false,
        error: false
      };

      deepFreeze(stateBefore);

      const action = {
        type: TT_FETCH_ERROR
      };

      const stateAfter = {
        list: [],
        loading: false,
        error: true
      };

      const res = trendingTags(stateBefore, action);

      expect(res).toEqual(stateAfter);
    });
  });
});
