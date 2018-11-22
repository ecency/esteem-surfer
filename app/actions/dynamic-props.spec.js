/* eslint-disable */
import * as actions from './dynamic-props';

describe('dynamic props actions', () => {
  it('(1) fetched action creator', () => {
    const steemPerMVests = 495.05469644322403;
    const base = 0.86;
    const quote = 1;
    const fundRecentClaims = '497885072157522967';
    const fundRewardBalance = 834665.854;

    expect(
      actions.fetched(
        steemPerMVests,
        base,
        quote,
        fundRecentClaims,
        fundRewardBalance
      )
    ).toMatchSnapshot();
  });
});
