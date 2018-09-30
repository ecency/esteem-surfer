import * as React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

// i18n
import {addLocaleData, IntlProvider} from 'react-intl';
import en from 'react-intl/locale-data/en';
import tr from 'react-intl/locale-data/tr';

import {Modal} from 'antd';

import {exposePin, wipePin} from '../actions/global';
import {updateActiveAccountData} from '../actions/accounts'

import PinCreate from '../components/dialogs/PinCreate';
import PinConfirm from '../components/dialogs/PinConfirm';

import {flattenMessages} from '../utils';
import messages from '../locales';
import {getItem, setItem, removeItem} from '../helpers/storage';

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
    setInterval(() => {
      const {dialogVisible} = this.state;

      if (dialogVisible) {
        return;
      }

      // Check welcome

      // Check pin code created
      const pinCode = getItem('pin-code');
      if (!pinCode) {
        const {actions} = this.props;
        actions.wipePin();
        this.setState({pinCreateFlag: true, dialogVisible: true});
        return;
      }

      // Check pin code entered
      const {global} = this.props;
      const {pin} = global;
      if (!pin) {
        this.setState({pinConfirmFlag: true, dialogVisible: true});
      }
    }, 500);


    this.refreshActiveAccount();
    setInterval(this.refreshActiveAccount, 60000);
  }

  refreshActiveAccount = () => {
    const {accounts, actions} = this.props;
    const {activeAccount} = accounts;

    if (!activeAccount) {
      return;
    }

    actions.updateActiveAccountData(activeAccount.username);
  };

  onCreatePinSuccess = (code, hashedCode) => {
    const {actions} = this.props;
    setItem('pin-code', hashedCode);
    actions.exposePin(code);
    this.setState({pinCreateFlag: false, dialogVisible: false});
  };

  onConfirmPinSuccess = code => {
    const {actions} = this.props;
    actions.exposePin(code);
    this.setState({pinConfirmFlag: false, dialogVisible: false});
  };

  pinInvalidate = () => {
    const {actions} = this.props;
    actions.wipePin();
    removeItem('pin-code');
    this.setState({pinConfirmFlag: false, dialogVisible: false});
  };

  render() {
    const {pinCreateFlag, pinConfirmFlag} = this.state;
    const {children, global} = this.props;
    const {locale} = global;

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
              <PinCreate onSuccess={this.onCreatePinSuccess}/>
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

App.propTypes = {
  children: PropTypes.element.isRequired,
  global: PropTypes.shape({
    locale: PropTypes.string.isRequired,
    pin: PropTypes.string
  }).isRequired,
  accounts: PropTypes.shape({
    activeAccount: PropTypes.instanceOf(Object)
  }).isRequired,
  actions: PropTypes.shape({
    exposePin: PropTypes.func.isRequired,
    wipePin: PropTypes.func.isRequired
  }).isRequired
};

function mapStateToProps(state) {
  return {
    global: state.global,
    accounts: state.accounts
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({exposePin}, dispatch),
      ...bindActionCreators({wipePin}, dispatch),
      ...bindActionCreators({updateActiveAccountData}, dispatch)
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
