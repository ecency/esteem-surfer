export const SET = 'visiting-profile/SET';

export const setVisitingProfile = accountData => dispatch => {
  dispatch({
    type: SET,
    payload: { accountData }
  });
};
