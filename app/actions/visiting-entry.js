export const SET = 'visiting-entry/SET';

export const setVisitingEntry = entry => dispatch => {
  dispatch({
    type: SET,
    payload: { entry }
  });
};
