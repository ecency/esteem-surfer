import {
  getDynamicGlobalProperties,
  getFeedHistory,
  getRewardFund
} from '../backend/steem-client';
import parseToken from '../utils/parse-token';

export const FETCHED = 'dynamic-props/FETCHED';

export const fetchGlobalProps = () => async dispatch => {
  let globalDynamic;
  let feedHistory;
  let rewardFund;

  try {
    globalDynamic = await getDynamicGlobalProperties();
    feedHistory = await getFeedHistory();
    rewardFund = await getRewardFund();
  } catch (e) {
    return;
  }

  const steemPerMVests =
    (parseToken(globalDynamic.total_vesting_fund_steem) /
      parseToken(globalDynamic.total_vesting_shares)) *
    1e6;
  const base = parseToken(feedHistory.current_median_history.base);
  const fundRecentClaims = rewardFund.recent_claims;
  const fundRewardBalance = parseToken(rewardFund.reward_balance);

  dispatch(fetched(steemPerMVests, base, fundRecentClaims, fundRewardBalance));
};

/* action creators */

export const fetched = (
  steemPerMVests,
  base,
  fundRecentClaims,
  fundRewardBalance
) => ({
  type: FETCHED,
  payload: { steemPerMVests, base, fundRecentClaims, fundRewardBalance }
});
