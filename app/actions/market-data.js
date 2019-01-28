import { getMarketData } from '../backend/esteem-client';

export const FETCHED = 'MARKET-DATA/FETCHED';

export const fetchMarketData = () => async dispatch => {
  const data = await getMarketData();

  if (data) {
    dispatch(fetched(data));
  }
};

/* action creators */

export const fetched = data => ({
  type: FETCHED,
  payload: data
});
