import { addLocaleData, IntlProvider } from 'react-intl';

import en from 'react-intl/locale-data/en';
import tr from 'react-intl/locale-data/tr';

import { getItem } from '../helpers/storage';
import { flattenMessages } from './index';
import messages from '../locales';

addLocaleData([...en, ...tr]);

let locale;
let intl;

const setupIntl = () => {
  ({ intl } = new IntlProvider({
    locale,
    messages: flattenMessages(messages[locale])
  }, {}).getChildContext());
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

export default (key, values = {}) => {
  return intl.formatMessage({ id: key }, values);
}