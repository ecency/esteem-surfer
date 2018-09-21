/* eslint-disable */

import sumTotal from './sum-total';

describe('sum total', () => {
  it('(1) should calculate sum total for not paid out post', () => {
    const input = {
      last_payout: '1970-01-01T00:00:00',
      pending_payout_value: '567.055 SBD',
      total_payout_value: '0.000 SBD',
      curator_payout_value: '0.000 SBD'
    };
    const expected = 567.055;
    expect(sumTotal(input)).toBe(expected);
  });

  it('(2) should calculate sum total for paid out post', () => {
    const input = {
      last_payout: '2018-08-22T12:00:00',
      pending_payout_value: '0.000 SBD',
      total_payout_value: '567.055 SBD',
      curator_payout_value: '1.070 SBD'
    };
    const expected = 568.125;
    expect(sumTotal(input)).toBe(expected);
  });
});
