/* eslint-disable */
import formatVest from './format-vest';

describe('formatVest', () => {
  it('format number for vests', () => {
    let input = 58843.0;
    expect(formatVest(input)).toMatchSnapshot();
  });

  it('format number for vests 2', () => {
    let input = 558843.0;
    expect(formatVest(input)).toMatchSnapshot();
  });

  it('format number for vests 3', () => {
    let input = 9999999.0;
    expect(formatVest(input)).toMatchSnapshot();
  });

  it('format number for vests 4', () => {
    let input = 9999999.213213;
    expect(formatVest(input)).toMatchSnapshot();
  });
});
