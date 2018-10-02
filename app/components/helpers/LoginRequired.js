import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import { Modal } from 'antd';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';

import Login from '../dialogs/Login';

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

    const { onDialogOpen } = this.props;
    onDialogOpen();
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
  };

  afterModalClose = () => {
    const { onDialogClose } = this.props;
    onDialogClose();
  };

  render() {
    const { children, activeAccount, requiredKeys } = this.props;
    const { loginModalVisible } = this.state;

    // Steem connect login.
    if (activeAccount && activeAccount.type === 'sc') {
      return children;
    }

    // Traditional login. Check all required keys exists in user keys.
    if (
      activeAccount &&
      activeAccount.type === 's' &&
      requiredKeys.every(e => activeAccount.keys[e])
    ) {
      return children;
    }

    let loginMsg = <FormattedMessage id="login-required.default" />;

    if (activeAccount) {
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
  onDialogClose: () => {}
};

LoginRequired.propTypes = {
  children: PropTypes.element.isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  requiredKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  onDialogOpen: PropTypes.func,
  onDialogClose: PropTypes.func
};

export default LoginRequired;
