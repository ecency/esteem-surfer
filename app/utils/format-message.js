import { addLocaleData, IntlProvider } from 'react-intl';

import en from 'react-intl/locale-data/en';
import tr from 'react-intl/locale-data/tr';
import ru from 'react-intl/locale-data/ru';
import ko from 'react-intl/locale-data/ko';
import es from 'react-intl/locale-data/es';
import pt from 'react-intl/locale-data/pt';
import pl from 'react-intl/locale-data/pl';
import hu from 'react-intl/locale-data/hu';
import nl from 'react-intl/locale-data/nl';
import de from 'react-intl/locale-data/de';

import { getItem } from '../helpers/storage';
import { flattenMessages } from './index';
import messages, { intlLocale } from '../locales';

addLocaleData([
  ...en,
  ...tr,
  ...ru,
  ...ko,
  ...es,
  ...pt,
  ...pl,
  ...hu,
  ...nl,
  ...de
]);

let locale;
let intl;

const setupIntl = () => {
  ({ intl } = new IntlProvider(
    {
      locale: intlLocale(locale),
      messages: flattenMessages(messages[locale])
    },
    {}
  ).getChildContext());
};

const watchLocale = () => {
  const c = getItem('locale', 'en-US');
  if (c !== locale) {
    locale = c;
    setupIntl();
  }

  setTimeout(watchLocale, 3000);
};

watchLocale();

export default (key, values = {}) => intl.formatMessage({ id: key }, values);
