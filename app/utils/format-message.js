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
import ro from 'react-intl/locale-data/ro';
import ms from 'react-intl/locale-data/ms';
import lt from 'react-intl/locale-data/lt';
import zh from 'react-intl/locale-data/zh';
import id from 'react-intl/locale-data/id';
import sr from 'react-intl/locale-data/sr';
import yo from 'react-intl/locale-data/yo';
import uk from 'react-intl/locale-data/uk';
import sv from 'react-intl/locale-data/sv';
import ja from 'react-intl/locale-data/ja';
import fr from 'react-intl/locale-data/fr';
import it from 'react-intl/locale-data/it';
import he from 'react-intl/locale-data/he';

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
  ...de,
  ...ro,
  ...ms,
  ...lt,
  ...zh,
  ...id,
  ...sr,
  ...yo,
  ...uk,
  ...sv,
  ...ja,
  ...fr,
  ...it,
  ...he
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
