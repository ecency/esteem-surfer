import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import { Modal } from 'antd';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';

import Login from '../dialogs/Login';

export const checkLogin = (activeAccount, requiredKeys) => {
  // Steem connect login.
  if (activeAccount && activeAccount.type === 'sc') {
    return true;
  }

  // Traditional login. Check all required keys exists in user keys.
  if (activeAccount && activeAccount.type === 's') {
    if (requiredKeys.includes('memo')) {
      return (
        activeAccount.keys.memo ||
        activeAccount.keys.posting ||
        activeAccount.keys.active ||
        activeAccount.keys.owner
      );
    }
    if (requiredKeys.includes('posting')) {
      return (
        activeAccount.keys.posting ||
        activeAccount.keys.active ||
        activeAccount.keys.owner
      );
    }
    if (requiredKeys.includes('active')) {
      return activeAccount.keys.active || activeAccount.keys.owner;
    }
    if (requiredKeys.includes('owner')) {
      return activeAccount.keys.owner || activeAccount.keys.master;
    }

    return true;
  }
  return false;
};

class LoginRequired extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loginModalVisible: false
    };
  }

  showLoginModal = () => {
    this.setState({
      loginModalVisible: true
    });

    setTimeout(() => {
      const { onDialogOpen } = this.props;
      onDialogOpen();
    }, 200);
  };

  onLoginModalCancel = () => {
    this.setState({
      loginModalVisible: false
    });
  };

  onLoginSuccess = () => {
    this.setState({
      loginModalVisible: false
    });

    setTimeout(() => {
      if (!this.check()) {
        this.showLoginModal();
      }
    }, 400);
  };

  afterModalClose = () => {
    const { onDialogClose } = this.props;
    onDialogClose();
  };

  check = () => {
    const { activeAccount, requiredKeys } = this.props;

    return checkLogin(activeAccount, requiredKeys);
  };

  render() {
    const { children } = this.props;

    if (this.check()) {
      return children;
    }

    const { activeAccount, requiredKeys } = this.props;
    const { loginModalVisible } = this.state;

    // Default message
    let loginMsg = <FormattedMessage id="login-required.default" />;

    if (activeAccount) {
      // More specific, key based message
      loginMsg =
        requiredKeys.length > 1 ? (
          <FormattedHTMLMessage
            id="login-required.keys-required"
            values={{ keys: requiredKeys }}
          />
        ) : (
          <FormattedHTMLMessage
            id="login-required.key-required"
            values={{ key: requiredKeys }}
          />
        );
    }

    // Clone child element rewriting onclick event
    const newChild = React.cloneElement(children, {
      onClick: () => {
        this.showLoginModal();
      }
    });

    return (
      <Fragment>
        {newChild}

        <Modal
          visible={loginModalVisible}
          onCancel={this.onLoginModalCancel}
          footer={false}
          width="500px"
          closable={false}
          destroyOnClose
          centered
          afterClose={this.afterModalClose}
        >
          <Login
            {...this.props}
            onSuccess={this.onLoginSuccess}
            loginMsg={loginMsg}
          />
        </Modal>
      </Fragment>
    );
  }
}

LoginRequired.defaultProps = {
  activeAccount: null,
  onDialogOpen: () => {},
  onDialogClose: () => {},
  requiredKeys: []
};

LoginRequired.propTypes = {
  children: PropTypes.element.isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  requiredKeys: PropTypes.arrayOf(PropTypes.string),
  onDialogOpen: PropTypes.func,
  onDialogClose: PropTypes.func
};

export default LoginRequired;
