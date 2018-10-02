/* eslint-disable */
import dynamicProps from './dynamic-props';

import { FETCHED } from '../actions/dynamic-props';

import deepFreeze from 'deep-freeze';
import { TT_FETCH_BEGIN } from '../actions/trending-tags';
import trendingTags from './trending-tags';

describe('dynamic props reducer', () => {
  let state = undefined;

  it('(1) default state', () => {
    state = dynamicProps(state, {});

    expect(state).toMatchSnapshot();
  });

  it('should handle TT_FETCH_BEGIN', () => {
    const stateBefore = {
      base: 1,
      fundRecentClaims: 1,
      fundRewardBalance: 1,
      steemPerMVests: 1
    };

    deepFreeze(stateBefore);

    const action = {
      type: FETCHED,
      payload: {
        base: 0.86,
        fundRecentClaims: '497885072157522967',
        fundRewardBalance: 834665.854,
        steemPerMVests: 495.05469644322403
      }
    };

    state = dynamicProps(state, action);

    expect(state).toMatchSnapshot();
  });
});
