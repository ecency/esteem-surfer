import { FETCHED } from '../actions/dynamic-props';

const defaultState = {
  steemPerMVests: 1,
  base: 1,
  quote: 1,
  fundRecentClaims: 1,
  fundRewardBalance: 1
};

export default function dynamicProps(state = defaultState, action) {
  switch (action.type) {
    case FETCHED: {
      const { payload } = action;
      const {
        steemPerMVests,
        base,
        quote,
        fundRecentClaims,
        fundRewardBalance
      } = payload;
      return Object.assign({}, state, {
        steemPerMVests,
        base,
        quote,
        fundRecentClaims,
        fundRewardBalance
      });
    }
    default:
      return state;
  }
}
