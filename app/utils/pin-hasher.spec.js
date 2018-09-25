/* eslint-disable */

import pinHasher from './pin-hasher';

describe('Pin hasher', () => {
  it('(1) hash', () => {
    expect(pinHasher('1234')).toBe('81dc9bdb52d04dc20036dbd8313ed055');
  });
});
