import getSymbolFromCurrency from 'currency-symbol-map';

export default (cur: string) => getSymbolFromCurrency(cur.toUpperCase());
