import * as React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import PinCreate from '../components/screens/PinCreate'

// i18n
import {addLocaleData, IntlProvider} from 'react-intl';
import en from 'react-intl/locale-data/en';
import tr from 'react-intl/locale-data/tr';

import {flattenMessages} from '../utils';
import messages from '../locales';

addLocaleData([...en, ...tr]);

class App extends React.Component {
  render() {
    const {children, global} = this.props;
    const {locale} = global;

    return (
      <IntlProvider
        locale={locale}
        messages={flattenMessages(messages[locale])}
      >
        <React.Fragment>{children} <PinCreate {...this.props} /></React.Fragment>
      </IntlProvider>
    );
  }
}

App.propTypes = {
  children: PropTypes.element.isRequired,
  global: PropTypes.shape({
    locale: PropTypes.string.isRequired
  }).isRequired
};

function mapStateToProps(state) {
  return {
    global: state.global
  };
}

export default connect(mapStateToProps)(App);
