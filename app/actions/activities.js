import { getUnreadActivityCount } from '../backend/esteem-client';

export const FETCHED = 'activities/FETCHED';
export const RESET = 'activities/RESET';

export const fetchActivities = username => async (dispatch, getState) => {
  const { activeAccount } = getState();
  if (!activeAccount) {
    return;
  }

  const unread = await getUnreadActivityCount(username);

  dispatch(fetched(unread));
};

export const resetActivities = () => dispatch => {
  dispatch(reset());
};

/* action creators */

export const fetched = unread => ({
  type: FETCHED,
  payload: { unread }
});

export const reset = () => ({
  type: RESET
});
