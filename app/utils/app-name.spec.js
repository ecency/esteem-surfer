/* eslint-disable */

import appName from './app-name';

describe('app name', () => {
  it('(1) should return empty string if argument given is null or undefined or empty string', () => {
    let input = '';
    let expected = '';
    expect(appName(input)).toBe(expected);

    input = undefined;
    expected = '';
    expect(appName(input)).toBe(expected);

    input = null;
    expected = '';
    expect(appName(input)).toBe(expected);
  });

  it('(2) should return app name if string', () => {
    let input = 'esteem';
    let expected = 'esteem';
    expect(appName(input)).toBe(expected);
  });

  it('(3) should return app name if object', () => {
    let input = { name: 'esteem-surfer' };
    let expected = 'esteem-surfer';
    expect(appName(input)).toBe(expected);
  });

  it('(4) should return empty string if given object has no "name" property', () => {
    let input = { na: 'esteem-surfer' };
    let expected = '';
    expect(appName(input)).toBe(expected);
  });
});
