import moment from 'moment';

require('moment-timezone');

const _tz = moment.tz.guess();

export default ($rootScope) => {

  const dateFormatted = (input, format = 'long') => {
    moment.locale($rootScope.language);

    let d = moment.utc(input);

    let formatter = 'LLL';

    if (format === 'short') {
      formatter = 'LL'
    }

    return d.tz(_tz).format(formatter);
  };

  dateFormatted.$stateful = true;
  return dateFormatted;
}
