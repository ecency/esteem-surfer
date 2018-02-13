export default ($filter) => {

  const timeAgo = (input, allowFuture = false) => {

    const substitute = (stringOrFunction, number, strings) => {
      let s = angular.isFunction(stringOrFunction) ? stringOrFunction(number, dateDifference) : stringOrFunction;
      let v = (strings.numbers && strings.numbers[number]) || number;
      return s.replace(/%d/i, v);
    };

    if (input) {
      let nowTime = (new Date()).getTime();
      let date;
      if (typeof input === 'string' || input instanceof String) {
        date = (input && input.indexOf('Z') === -1) ? (new Date(input + ".000Z")).getTime() : (new Date(input)).getTime();
      } else {
        date = input;
      }

      let strings = {
          prefixAgo: '',
          prefixFromNow: '',
          suffixAgo: $filter('translate')('AGO'),
          suffixFromNow: $filter('translate')('FROM_NOW'),
          seconds: $filter('translate')('SECS'),
          minute: $filter('translate')('A_MIN'),
          minutes: "%d " + $filter('translate')('MINS'),
          hour: $filter('translate')('AN_HOUR'),
          hours: "%d " + $filter('translate')('HOURS'),
          day: $filter('translate')('A_DAY'),
          days: "%d " + $filter('translate')('DAYS'),
          month: $filter('translate')('A_MONTH'),
          months: "%d " + $filter('translate')('MONTHS'),
          year: $filter('translate')('A_YEAR'),
          years: "%d " + $filter('translate')('YEARS')
        },
        dateDifference = nowTime - date,
        words,
        seconds = Math.abs(dateDifference) / 1000,
        minutes = seconds / 60,
        hours = minutes / 60,
        days = hours / 24,
        years = days / 365,
        separator = strings.wordSeparator === undefined ? " " : strings.wordSeparator,

        prefix = strings.prefixAgo,
        suffix = strings.suffixAgo;

      if (allowFuture) {
        if (dateDifference < 0) {
          prefix = strings.prefixFromNow;
          suffix = strings.suffixFromNow;
        }
      }

      words = seconds < 45 && substitute(strings.seconds, Math.round(seconds), strings) ||
        seconds < 90 && substitute(strings.minute, 1, strings) ||
        minutes < 45 && substitute(strings.minutes, Math.round(minutes), strings) ||
        minutes < 90 && substitute(strings.hour, 1, strings) ||
        hours < 24 && substitute(strings.hours, Math.round(hours), strings) ||
        hours < 42 && substitute(strings.day, 1, strings) ||
        days < 30 && substitute(strings.days, Math.round(days), strings) ||
        days < 45 && substitute(strings.month, 1, strings) ||
        days < 365 && substitute(strings.months, Math.round(days / 30), strings) ||
        years < 1.5 && substitute(strings.year, 1, strings) ||
        substitute(strings.years, Math.round(years), strings);

      prefix.replace(/ /g, '');
      words.replace(/ /g, '');
      suffix.replace(/ /g, '');

      return `${prefix} ${words} ${suffix} ${separator}`;
    }
  };

  timeAgo.$stateful = true;
  return timeAgo;

}
