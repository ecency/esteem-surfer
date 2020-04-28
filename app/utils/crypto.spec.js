/* eslint-disable */

import { pinHasher } from './crypto';

describe('Crypto', () => {
  it('(1) hash', () => {
    expect(pinHasher('1234')).toBe('81dc9bdb52d04dc20036dbd8313ed055');
  });
});
