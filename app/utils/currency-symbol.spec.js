/* eslint-disable */
import currencySymbol from './currency-symbol';

describe('currency-symbol', () => {
  it('(1) usd', () => {
    const input = 'usd';
    expect(currencySymbol(input)).toMatchSnapshot();
  });

  it('(2) eur', () => {
    const input = 'eur';
    expect(currencySymbol(input)).toMatchSnapshot();
  });

  it('(3) try', () => {
    const input = 'try';
    expect(currencySymbol(input)).toMatchSnapshot();
  });
});
