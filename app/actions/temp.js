export const TEMP_SET = 'TEMP_SET';
export const TEMP_RESET = 'TEMP_RESET';

/* action creators */

export const tempSet = payload => ({
  type: TEMP_SET,
  payload
});

export const tempReset = () => ({
  type: TEMP_RESET
});
