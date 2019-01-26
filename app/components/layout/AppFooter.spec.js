/* eslint-disable */

import { powerImg } from './AppFooter';

describe('AppFooter', () => {
  it('powerImg 1', () => {
    expect(powerImg(101)).toBe(100);
  });

  it('powerImg 1', () => {
    expect(powerImg(100)).toBe(100);
  });

  it('powerImg 1', () => {
    expect(powerImg(95)).toBe(90);
  });

  it('powerImg 1', () => {
    expect(powerImg(3)).toBe(10);
  });
});
