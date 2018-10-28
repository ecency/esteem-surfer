import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

// i18n
import { addLocaleData, IntlProvider } from 'react-intl';
import en from 'react-intl/locale-data/en';
import tr from 'react-intl/locale-data/tr';

import { Modal } from 'antd';

import { exposePin, wipePin } from '../actions/global';
import { fetchGlobalProps } from '../actions/dynamic-props';
import { deleteAccounts } from '../actions/accounts';
import { logOut, updateActiveAccount } from '../actions/active-account';

import PinCreate from '../components/dialogs/PinCreate';
import PinConfirm from '../components/dialogs/PinConfirm';

import { flattenMessages } from '../utils';
import messages from '../locales';
import { getItem, setItem, removeItem } from '../helpers/storage';

addLocaleData([...en, ...tr]);

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dialogVisible: false,
      pinCreateFlag: false,
      pinConfirmFlag: false
    };
  }

  componentDidMount() {
    // Check for welcome screen and pin code
    this.dialogInterval = setInterval(this.checkDialogs, 500);

    // Refresh global props
    this.refreshGlobalProps();
    this.globalInterval = setInterval(this.refreshGlobalProps, 60000);

    // Refresh active account data
    this.refreshActiveAccount();
    this.activeAccountInterval = setInterval(this.refreshActiveAccount, 15000);
  }

  componentWillUnmount() {
    clearInterval(this.dialogInterval);
    clearInterval(this.globalInterval);
    clearInterval(this.activeAccountInterval);
  }

  checkDialogs = () => {
    const { dialogVisible } = this.state;

    if (dialogVisible) {
      return;
    }

    // Check welcome screen

    // Check pin code created
    const pinCode = getItem('pin-code');
    if (!pinCode) {
      const { actions } = this.props;
      actions.wipePin();
      this.setState({ pinCreateFlag: true, dialogVisible: true });
      return;
    }

    // Check pin code entered
    const { global } = this.props;
    const { pin } = global;
    if (!pin) {
      this.setState({ pinConfirmFlag: true, dialogVisible: true });
    }
  };

  refreshGlobalProps = () => {
    const { actions } = this.props;

    actions.fetchGlobalProps();
  };

  refreshActiveAccount = () => {
    const { activeAccount, actions } = this.props;

    if (activeAccount) {
      actions.updateActiveAccount(activeAccount.username);
    }
  };

  onCreatePinSuccess = (code, hashedCode) => {
    const { actions } = this.props;
    setItem('pin-code', hashedCode);
    actions.exposePin(code);
    this.setState({ pinCreateFlag: false, dialogVisible: false });
  };

  onConfirmPinSuccess = code => {
    const { actions } = this.props;
    actions.exposePin(code);
    this.setState({ pinConfirmFlag: false, dialogVisible: false });
  };

  pinInvalidate = () => {
    const { actions } = this.props;
    actions.wipePin();

    removeItem('pin-code');

    actions.logOut();
    actions.deleteAccounts();

    this.setState({ pinConfirmFlag: false, dialogVisible: false });
  };

  render() {
    const { pinCreateFlag, pinConfirmFlag } = this.state;
    const { children, global } = this.props;
    const { locale } = global;

    return (
      <IntlProvider
        locale={locale}
        messages={flattenMessages(messages[locale])}
      >
        <React.Fragment>
          {children}

          {pinCreateFlag && (
            <Modal
              footer={null}
              closable={false}
              keyboard={false}
              visible
              width="500px"
              centered
              destroyOnClose
            >
              <PinCreate onSuccess={this.onCreatePinSuccess} />
            </Modal>
          )}

          {pinConfirmFlag && (
            <Modal
              footer={null}
              closable={false}
              keyboard={false}
              visible
              width="500px"
              centered
              destroyOnClose
            >
              <PinConfirm
                compareHash={getItem('pin-code')}
                onSuccess={this.onConfirmPinSuccess}
                invalidateFn={this.pinInvalidate}
              />
            </Modal>
          )}
        </React.Fragment>
      </IntlProvider>
    );
  }
}

App.defaultProps = {
  activeAccount: null
};

App.propTypes = {
  children: PropTypes.element.isRequired,
  global: PropTypes.shape({
    locale: PropTypes.string.isRequired,
    pin: PropTypes.string
  }).isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  actions: PropTypes.shape({
    exposePin: PropTypes.func.isRequired,
    wipePin: PropTypes.func.isRequired,
    updateActiveAccount: PropTypes.func.isRequired,
    logOut: PropTypes.func.isRequired,
    fetchGlobalProps: PropTypes.func.isRequired,
    deleteAccounts: PropTypes.func.isRequired
  }).isRequired
};

function mapStateToProps(state) {
  return {
    global: state.global,
    activeAccount: state.activeAccount
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({ exposePin }, dispatch),
      ...bindActionCreators({ wipePin }, dispatch),
      ...bindActionCreators({ updateActiveAccount }, dispatch),
      ...bindActionCreators({ logOut }, dispatch),
      ...bindActionCreators({ fetchGlobalProps }, dispatch),
      ...bindActionCreators({ deleteAccounts }, dispatch)
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
