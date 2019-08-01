import React, { Component } from 'react';

import PropTypes from 'prop-types';

import { PrivateKey, PublicKey } from 'dsteem';

import { Button, Divider, Input, Alert, message } from 'antd';
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl';

import Tooltip from '../common/Tooltip';

import scLogo from '../../img/steem-connect.svg';
import logo from '../../img/logo-big.png';

import { getAccounts } from '../../backend/steem-client';

import { scLogin } from '../../helpers/sc';
import UserAvatar from '../elements/UserAvatar';

import { scTokenRenew, usrActivity } from '../../backend/esteem-client';
import PinRequired from '../helpers/PinRequired';

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      processing: false
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

  deleteAccount = username => {
    const { activeAccount, actions } = this.props;

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

  render() {
    const { accounts, loginMsg, intl, activeAccount } = this.props;
    const { processing } = this.state;

    const activeUsername = activeAccount ? activeAccount.username : null;

    return (
      <div className="login-dialog-content">
        <div className="login-header">
          <div className="logo">
            <img src={logo} alt="logo" />
          </div>
          <div className="login-header-text">
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
                <div
                  key={account.username}
                  className={`account-list-item ${
                    activeUsername === account.username ? 'active' : ''
                  }`}
                  role="none"
                >
                  <UserAvatar user={account.username} size="normal" />{' '}
                  <span className="username">@{account.username}</span>
                  {activeUsername === account.username && (
                    <div className="check-mark" />
                  )}
                  <div className="space" />
                  {activeUsername !== account.username && (
                    <div
                      role="none"
                      className="btn-login"
                      onClick={() => {
                        this.switchToAccount(account.username);
                      }}
                    >
                      <Tooltip
                        title={intl.formatMessage({ id: 'login.login' })}
                      >
                        <i className="mi">check</i>
                      </Tooltip>
                    </div>
                  )}
                  <PinRequired
                    {...this.props}
                    onSuccess={() => {
                      this.deleteAccount(account.username);
                    }}
                  >
                    <div className="btn-delete">
                      <Tooltip title={intl.formatMessage({ id: 'g.delete' })}>
                        <i className="mi">delete_forever</i>
                      </Tooltip>
                    </div>
                  </PinRequired>
                </div>
              ))}
            </div>
          </div>
        )}

        {accounts.length > 0 && (
          <Divider>
            <FormattedMessage id="login.divider-text" />
          </Divider>
        )}

        <div className="login-form">
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
            <FormattedHTMLMessage id="login.create-account-text" />
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
  accounts: [],
  activeAccount: null
};

Login.propTypes = {
  actions: PropTypes.shape({
    addAccount: PropTypes.func.isRequired,
    addAccountSc: PropTypes.func.isRequired,
    logIn: PropTypes.func.isRequired,
    logOut: PropTypes.func.isRequired,
    updateActiveAccount: PropTypes.func.isRequired,
    deleteAccount: PropTypes.func.isRequired
  }).isRequired,
  onSuccess: PropTypes.func.isRequired,
  accounts: PropTypes.arrayOf(PropTypes.object),
  loginMsg: PropTypes.element,
  activeAccount: PropTypes.instanceOf(Object),
  intl: PropTypes.instanceOf(Object).isRequired
};

export default injectIntl(Login);
