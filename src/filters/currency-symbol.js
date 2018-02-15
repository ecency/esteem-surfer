import getSymbolFromCurrency from 'currency-symbol-map';


export default () => {
  return (cur) => {
    return getSymbolFromCurrency(cur.toUpperCase());
  };
}
