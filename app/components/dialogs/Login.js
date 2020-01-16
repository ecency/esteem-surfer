/*
eslint-disable react/no-multi-comp, jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
*/

import React, { Component, Fragment } from 'react';

import PropTypes from 'prop-types';

import { PrivateKey, PublicKey } from 'dsteem';

import {
  Button,
  Divider,
  Input,
  Alert,
  message,
  Popconfirm,
  Modal
} from 'antd';

import { FormattedMessage } from 'react-intl';

import Tooltip from '../common/Tooltip';

import UserAvatar from '../elements/UserAvatar';

import PinConfirm from './PinConfirm';

import { getAccounts } from '../../backend/steem-client';

import {
  scTokenRenew,
  usrActivity,
  signUp as signUpFn
} from '../../backend/esteem-client';

import { scLogin } from '../../helpers/sc';

import scLogo from '../../img/steem-connect.svg';

import logo from '../../img/logo-big.png';

class AccountItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      del: false
    };
  }

  deleteAccount = () => {
    const { activeAccount, actions, account } = this.props;
    const { username } = account;

    if (activeAccount && activeAccount.username === username) {
      actions.logOut();
    }

    actions.deleteAccount(username);

    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('account-deleted', { detail: { username } })
      );
    }, 300);
  };

  render() {
    const { account, intl, activeAccount, onSelect } = this.props;
    const { del } = this.state;

    const activeUsername = activeAccount ? activeAccount.username : null;

    return (
      <div
        key={account.username}
        className={`account-list-item ${
          activeUsername === account.username ? 'active' : ''
        }`}
        onClick={() => {
          onSelect(account.username);
        }}
        role="none"
      >
        <UserAvatar {...this.props} user={account.username} size="normal" />{' '}
        <span className="username">@{account.username}</span>
        {activeUsername === account.username && <div className="check-mark" />}
        <div className="space" />
        <Popconfirm
          title={intl.formatMessage({ id: 'g.are-you-sure' })}
          okText={intl.formatMessage({ id: 'g.ok' })}
          cancelText={intl.formatMessage({ id: 'g.cancel' })}
          onCancel={e => {
            e.stopPropagation();
            this.setState({ del: false });
          }}
          onConfirm={e => {
            e.stopPropagation();
            this.setState({ del: true });
          }}
        >
          <div
            role="none"
            className="btn-delete"
            onClick={e => {
              e.stopPropagation();
            }}
          >
            <Tooltip title={intl.formatMessage({ id: 'g.delete' })}>
              <i className="mi">delete_forever</i>
            </Tooltip>
          </div>
        </Popconfirm>
        {del && (
          <Modal
            footer={null}
            closable
            onCancel={e => {
              this.setState({ del: false });
              e.stopPropagation();
            }}
            keyboard
            visible
            width="500px"
            centered
            destroyOnClose
            maskClosable={false}
          >
            <PinConfirm {...this.props} onSuccess={this.deleteAccount} />
          </Modal>
        )}
      </div>
    );
  }
}

AccountItem.defaultProps = {
  activeAccount: null
};

AccountItem.propTypes = {
  actions: PropTypes.shape({
    logOut: PropTypes.func.isRequired,
    deleteAccount: PropTypes.func.isRequired
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  account: PropTypes.instanceOf(Object).isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  intl: PropTypes.instanceOf(Object).isRequired
};

class SignUp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      processing: false,
      username: '',
      email: '',
      refCode: '',
      done: false
    };
  }

  doSignUp = () => {
    const { username, email, refCode } = this.state;
    this.setState({ processing: true });

    return signUpFn(username, email, refCode)
      .then(resp => {
        this.setState({ done: true });
        return resp;
      })
      .catch(err => {
        if (err.response && err.response.data && err.response.data.message) {
          message.error(err.response.data.message);
        }
      })
      .finally(() => {
        this.setState({ processing: false });
      });
  };

  usernameChanged = e => {
    this.setState({ username: e.target.value });
  };

  emailChanged = e => {
    this.setState({ email: e.target.value });
  };

  refCodeChanged = e => {
    this.setState({ refCode: e.target.value });
  };

  login = () => {
    const { backFn } = this.props;
    backFn();
  };

  render() {
    const { intl } = this.props;
    const { processing, username, email, refCode, done } = this.state;

    return (
      <div className="sign-up-dialog-content">
        <div className="dialog-header">
          <div className="logo">
            <img src={logo} alt="logo" />
          </div>
          <div className="dialog-header-text">
            <FormattedMessage id="sign-up.title" />
          </div>
        </div>
        <div className="dialog-form">
          {(() => {
            if (done) {
              return (
                <div className="sign-up-success">
                  <p>
                    <i className="mi">check</i>
                    <FormattedMessage
                      id="sign-up.success-message-1"
                      values={{ email }}
                    />
                  </p>
                  <p>
                    <FormattedMessage id="sign-up.success-message-2" />
                  </p>
                  <p>
                    <Button
                      size="large"
                      htmlType="button"
                      type="primary"
                      block
                      onClick={this.login}
                    >
                      <FormattedMessage id="sign-up.login-btn-label" />
                    </Button>
                  </p>
                </div>
              );
            }

            return (
              <Fragment>
                <p>
                  <Input
                    type="text"
                    autoFocus
                    value={username}
                    onChange={this.usernameChanged}
                    placeholder={intl.formatMessage({
                      id: 'sign-up.username-placeholder'
                    })}
                  />
                </p>
                <p>
                  <Input
                    type="email"
                    value={email}
                    onChange={this.emailChanged}
                    placeholder={intl.formatMessage({
                      id: 'sign-up.email-placeholder'
                    })}
                  />
                </p>
                <p>
                  <Input
                    type="text"
                    value={refCode}
                    onChange={this.refCodeChanged}
                    placeholder={intl.formatMessage({
                      id: 'sign-up.ref-code'
                    })}
                  />
                </p>
                <p>
                  <Button
                    size="large"
                    htmlType="button"
                    type="primary"
                    block
                    disabled={processing}
                    onClick={this.doSignUp}
                  >
                    <FormattedMessage id="sign-up.sign-up" />
                  </Button>
                </p>
                <p>
                  <FormattedMessage id="sign-up.login-1" />
                  &nbsp;
                  <a onClick={this.login}>
                    <FormattedMessage id="sign-up.login-2" />
                  </a>
                </p>
              </Fragment>
            );
          })()}
        </div>
      </div>
    );
  }
}

SignUp.propTypes = {
  intl: PropTypes.instanceOf(Object).isRequired,
  backFn: PropTypes.func.isRequired
};

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      processing: false,
      signUp: false
    };
  }

  afterLogin = username => {
    const ev = new CustomEvent('user-login', { detail: { username } });
    window.dispatchEvent(ev);

    usrActivity(username, 20);
  };

  switchToAccount = username => {
    const { actions, onSuccess } = this.props;
    actions.logIn(username);
    onSuccess(username);
    this.afterLogin(username);
  };

  doScLogin = async () => {
    let resp;
    try {
      const loginResp = await scLogin();
      resp = await scTokenRenew(loginResp.code);
    } catch (e) {
      return;
    }

    const { actions, onSuccess } = this.props;
    actions.addAccountSc(
      resp.username,
      resp.access_token,
      resp.refresh_token,
      resp.expires_in
    );
    actions.logIn(resp.username);
    onSuccess(resp.username);
    this.afterLogin(resp.username);
  };

  doLogin = async () => {
    const { intl } = this.props;

    const username = document.querySelector('#txt-username').value.trim();
    const code = document.querySelector('#txt-code').value.trim();

    // Form validation
    if (username === '' || code === '') {
      message.error(intl.formatMessage({ id: 'login.error-fields-required' }));
      return false;
    }

    // Warn user if entered a public key
    let isPubkey;
    try {
      PublicKey.fromString(code);
      isPubkey = true;
    } catch (e) {
      isPubkey = false;
    }

    if (isPubkey) {
      message.error(intl.formatMessage({ id: 'login.error-public-key' }));
      return false;
    }

    // True if the code entered is password else false
    // const codeIsPassword = !auth.isWif(code);
    let codeIsPassword = false;
    try {
      PrivateKey.fromString(code);
    } catch (e) {
      codeIsPassword = true;
    }

    let accounts;

    this.setState({ processing: true });

    try {
      accounts = await getAccounts([username]);
    } catch (err) {
      message.error(intl.formatMessage({ id: 'login.error-user-fetch' }));
      return;
    } finally {
      this.setState({ processing: false });
    }

    // User not found
    if (accounts && accounts.length === 0) {
      message.error(intl.formatMessage({ id: 'login.error-user-not-found' }));
      return false;
    }

    // Account data
    const account = accounts[0];

    // Public keys of user
    const userPublicKeys = {
      active: account.active.key_auths.map(x => x[0]),
      memo: [account.memo_key],
      owner: account.owner.key_auths.map(x => x[0]),
      posting: account.posting.key_auths.map(x => x[0])
    };

    let loginFlag = false;
    const resultKeys = { active: null, memo: null, owner: null, posting: null };

    if (codeIsPassword) {
      // With master password

      // Get all private keys by username and password
      const userPrivateKeys = {};
      ['owner', 'active', 'posting', 'memo'].forEach(r => {
        const k = PrivateKey.fromLogin(account.name, code, r);

        userPrivateKeys[r] = k.toString();
        userPrivateKeys[`${r}Pubkey`] = k.createPublic().toString();
      });

      Object.keys(userPublicKeys).map(k => {
        const v = userPublicKeys[k];
        const v2 = userPrivateKeys[`${k}Pubkey`];

        if (v.includes(v2)) {
          resultKeys[k] = userPrivateKeys[k];
          loginFlag = true;
        }

        return null;
      });
    } else {
      // With wif
      const publicWif = PrivateKey.fromString(code)
        .createPublic()
        .toString();

      Object.keys(userPublicKeys).map(k => {
        const v = userPublicKeys[k];
        if (v.includes(publicWif)) {
          loginFlag = true;
          resultKeys[k] = code;
        }

        return null;
      });
    }

    if (!loginFlag) {
      message.error(intl.formatMessage({ id: 'login.error-authenticate' }));
      return false;
    }

    const { actions, onSuccess } = this.props;
    actions.addAccount(username, resultKeys);
    actions.logIn(username);
    onSuccess(username);
    this.afterLogin(username);
  };

  toggleSignUp = () => {
    const { signUp, processing } = this.state;
    if (processing) {
      return;
    }
    this.setState({ signUp: !signUp });
  };

  render() {
    const { accounts, loginMsg, intl } = this.props;
    const { processing, signUp } = this.state;

    if (signUp) {
      return <SignUp {...this.props} backFn={this.toggleSignUp} />;
    }

    return (
      <div className="login-dialog-content">
        <div className="dialog-header">
          <div className="logo">
            <img src={logo} alt="logo" />
          </div>
          <div className="dialog-header-text">
            <FormattedMessage id="login.title" />
          </div>
        </div>

        {loginMsg && (
          <div className="login-msg">
            <Alert message={loginMsg} showIcon />
          </div>
        )}

        {accounts.length > 0 && (
          <div className="account-list">
            <div className="account-list-header">
              <FormattedMessage id="login.accounts-title" />
            </div>
            <div className="account-list-body">
              {accounts.map(account => (
                <AccountItem
                  key={account.username}
                  account={account}
                  onSelect={this.switchToAccount}
                  {...this.props}
                />
              ))}
            </div>
          </div>
        )}

        {accounts.length > 0 && (
          <Divider>
            <FormattedMessage id="login.divider-text" />
          </Divider>
        )}

        <div className="dialog-form">
          <p className="form-text">
            <FormattedMessage id="login.traditional-login-desc" />
          </p>
          <p>
            <Input
              type="text"
              autoFocus
              id="txt-username"
              placeholder={intl.formatMessage({
                id: 'login.username-placeholder'
              })}
            />
          </p>
          <p>
            <Input
              type="password"
              id="txt-code"
              placeholder={intl.formatMessage({
                id: 'login.password-placeholder'
              })}
            />
          </p>
          <p>
            <Button
              size="large"
              htmlType="button"
              type="primary"
              block
              disabled={processing}
              onClick={this.doLogin}
            >
              <FormattedMessage id="login.login" />
            </Button>
          </p>
          <p>
            <FormattedMessage id="login.create-account-text-1" />
            &nbsp;
            <a onClick={this.toggleSignUp}>
              <FormattedMessage id="login.create-account-text-2" />
            </a>
          </p>
        </div>
        <Divider>
          <FormattedMessage id="login.divider-text" />
        </Divider>
        <div className="login-sc" role="none" onClick={this.doScLogin}>
          <p className="login-title">
            <FormattedMessage id="login.login-with-sc" />
          </p>
          <div className="logo">
            <img src={scLogo} alt="Steem Connect" />
          </div>
          <div className="sc-note">
            <FormattedMessage id="login.sc-note" />
          </div>
        </div>
      </div>
    );
  }
}

Login.defaultProps = {
  loginMsg: null,
  accounts: []
};

Login.propTypes = {
  actions: PropTypes.shape({
    addAccount: PropTypes.func.isRequired,
    addAccountSc: PropTypes.func.isRequired,
    logIn: PropTypes.func.isRequired,
    updateActiveAccount: PropTypes.func.isRequired
  }).isRequired,
  onSuccess: PropTypes.func.isRequired,
  accounts: PropTypes.arrayOf(PropTypes.object),
  loginMsg: PropTypes.element,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default Login;
