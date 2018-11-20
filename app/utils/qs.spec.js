/* eslint-disable */

import qs from './qs';

describe('Query string parser', () => {
  it('(1) should parse', () => {
    const input = '?q=lorem&m=ipsum dolor sit';

    expect(qs(input)).toMatchSnapshot();
  });

  it('(2) should parse', () => {
    const input =
      '?q=t%C3%BCrk%C3%A7e%20karakterler%20ve%20bo%C5%9Fluk&created=2018';

    expect(qs(input)).toMatchSnapshot();
  });
});
