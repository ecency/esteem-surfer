import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';

// i18n
import { addLocaleData, IntlProvider } from 'react-intl';
import en from 'react-intl/locale-data/en';
import tr from 'react-intl/locale-data/tr';

import Routes from '../Routes';
import { flattenMessages } from '../utils';
import messages from '../locales';

addLocaleData([...en, ...tr]);

class Root extends Component {
  render() {
    const { store, history } = this.props;

    const locale = 'en-US';

    return (
      <IntlProvider
        locale={locale}
        messages={flattenMessages(messages[locale])}
      >
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <Routes />
          </ConnectedRouter>
        </Provider>
      </IntlProvider>
    );
  }
}

Root.propTypes = {
  store: PropTypes.shape({}).isRequired,
  history: PropTypes.shape({}).isRequired
};

export default Root;
