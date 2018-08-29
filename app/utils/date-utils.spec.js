/* eslint-disable */
import { parseSteemDate } from './date-utils';

describe('Date Utilities', () => {
  it('(1) Parse steem date', () => {
    const input = '2018-08-28T22:10:21';

    expect(parseSteemDate(input).toUTCString()).toMatchSnapshot();
  });
});
