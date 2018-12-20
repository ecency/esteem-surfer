/* eslint-disable */

import amountFormatCheck from './amount-format-check';

describe('Amount format check', () => {
  it('Valid', () => {
    const input = `0.001`;
    expect(amountFormatCheck(input)).toBe(true);
  });

  it('Not valid', () => {
    const input = `0.`;
    expect(amountFormatCheck(input)).toBe(false);
  });

  it('Not valid 2', () => {
    const input = `foo`;
    expect(amountFormatCheck(input)).toBe(false);
  });
});
