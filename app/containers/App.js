import * as React from 'react';
import PropTypes from 'prop-types';

// i18n
import { addLocaleData, IntlProvider } from 'react-intl';
import en from 'react-intl/locale-data/en';
import tr from 'react-intl/locale-data/tr';

import { flattenMessages } from '../utils';
import messages from '../locales';

addLocaleData([...en, ...tr]);

class App extends React.Component {
  render() {
    const { children } = this.props;

    const locale = 'en-US';

    return (
      <IntlProvider
        locale={locale}
        messages={flattenMessages(messages[locale])}
      >
        <React.Fragment>{children}</React.Fragment>
      </IntlProvider>
    );
  }
}

App.propTypes = {
  children: PropTypes.element.isRequired
};

export default App;
