export default ($rootScope) => {
  const fn = (input, balance, sbd) => {
    if (!input) {
      return '';
    }

    return ((Number(input.split(" ")[0]) / 1e6 * $rootScope.steemPerMVests * $rootScope.base + Number(balance.split(" ")[0]) * $rootScope.base + Number(sbd.split(" ")[0])).toFixed(3)) * $rootScope.currencyRate;
  };

  fn.$stateful = true;
  return fn;
}
