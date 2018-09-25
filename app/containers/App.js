import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

// i18n
import { addLocaleData, IntlProvider } from 'react-intl';
import en from 'react-intl/locale-data/en';
import tr from 'react-intl/locale-data/tr';

import { exposePin } from '../actions/global';

import PinCreate from '../components/dialogs/PinCreate';

import { flattenMessages } from '../utils';
import messages from '../locales';

addLocaleData([...en, ...tr]);

class App extends React.Component {
  render() {
    const { children, global } = this.props;
    const { locale } = global;

    return (
      <IntlProvider
        locale={locale}
        messages={flattenMessages(messages[locale])}
      >
        <React.Fragment>
          {children} <PinCreate {...this.props} />
        </React.Fragment>
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

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({ exposePin }, dispatch)
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
