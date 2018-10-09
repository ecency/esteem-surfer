export const SET = 'visiting-account/SET';

export const setVisitingAccount = accountData => dispatch => {
  dispatch({
    type: SET,
    payload: { accountData }
  });
};
