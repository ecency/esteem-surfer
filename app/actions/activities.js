import {
  getActivities,
  getUnreadActivityCount
} from '../backend/esteem-client';

export const FETCHED = 'activities/FETCHED';
export const RESET = 'activities/RESET';

export const fetchActivities = username => async (dispatch, getState) => {
  const { activeAccount } = getState();
  if (!activeAccount) {
    return;
  }

  const unread = await getUnreadActivityCount(username);
  const list = await getActivities(username);

  dispatch(fetched(unread, list));
};

export const resetActivities = () => dispatch => {
  dispatch(reset());
};

/* action creators */

export const fetched = (unread, list) => ({
  type: FETCHED,
  payload: { unread, list }
});

export const reset = () => ({
  type: RESET
});
