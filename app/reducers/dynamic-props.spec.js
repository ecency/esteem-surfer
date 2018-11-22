/* eslint-disable */
import dynamicProps from './dynamic-props';

import { FETCHED } from '../actions/dynamic-props';

import deepFreeze from 'deep-freeze';

describe('dynamic props reducer', () => {
  let state = undefined;

  it('(1) default state', () => {
    state = dynamicProps(state, {});

    expect(state).toMatchSnapshot();
  });

  it('should handle FETCHED', () => {
    const stateBefore = {
      base: 1,
      quote: 1,
      fundRecentClaims: 1,
      fundRewardBalance: 1,
      steemPerMVests: 1
    };

    deepFreeze(stateBefore);

    const action = {
      type: FETCHED,
      payload: {
        base: 0.86,
        quote: 1,
        fundRecentClaims: '497885072157522967',
        fundRewardBalance: 834665.854,
        steemPerMVests: 495.05469644322403
      }
    };

    state = dynamicProps(state, action);

    expect(state).toMatchSnapshot();
  });
});
