import moment from 'moment';

require('moment-timezone');

const _tz = moment.tz.guess();

export default ($rootScope) => {

  const dateFormatted = (input) => {
    moment.locale($rootScope.language);

    let d = moment.utc(input);
    return d.tz(_tz).format('LLL');
  };

  dateFormatted.$stateful = true;
  return dateFormatted;
}
