/*
eslint-disable react/no-multi-comp,no-case-declarations,no-bitwise
*/

import React, { PureComponent } from 'react';
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl';

import PropTypes from 'prop-types';
import { Input, AutoComplete, Select, Button, Icon, message } from 'antd';
import NavBar from './layout/NavBar';
import AppFooter from './layout/AppFooter';
import PinRequired from './helpers/PinRequired';
import QuickProfile from './helpers/QuickProfile';
import UserAvatar from './elements/UserAvatar';
import LinearProgress from './common/LinearProgress';
import DeepLinkHandler from './helpers/DeepLinkHandler';

import {
  getRecentTransfers,
  appendToRecentTransfers
} from '../helpers/storage';

import {
  getAccount,
  transfer,
  transferToSavings,
  transferFromSavings,
  transferToVesting,
  transferPoint
} from '../backend/steem-client';

import { getPoints } from '../backend/esteem-client';

import formatChainError from '../utils/format-chain-error';
import parseToken from '../utils/parse-token';
import amountFormatCheck from '../utils/amount-format-check';

import badActors from '../data/bad-actors.json';
import { arrowRight } from '../svg';

class AssetSwitch extends PureComponent {
  constructor(props) {
    super(props);

    const { defaultSelected: selected } = this.props;

    this.state = {
      selected
    };
  }

  clicked = i => {
    this.setState({ selected: i });
    const { onChange } = this.props;
    onChange(i);
  };

  render() {
    const { selected } = this.state;

    return (
      <div className="asset-switch">
        <a
          onClick={() => this.clicked('STEEM')}
          role="none"
          className={`asset ${selected === 'STEEM' ? 'selected' : ''}`}
        >
          STEEM
        </a>
        <a
          onClick={() => this.clicked('SBD')}
          role="none"
          className={`asset ${selected === 'SBD' ? 'selected' : ''}`}
        >
          SBD
        </a>
        <a
          onClick={() => this.clicked('ESTM')}
          role="none"
          className={`asset ${selected === 'ESTM' ? 'selected' : ''}`}
        >
          ESTM
        </a>
      </div>
    );
  }
}

AssetSwitch.propTypes = {
  defaultSelected: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

class Transfer extends PureComponent {
  constructor(props) {
    super(props);

    this.state = this.resetState();
    this.timer = null;
  }

  componentDidMount() {
    this.init();

    window.addEventListener('user-login', this.init);
    window.addEventListener('account-deleted', this.init);
  }

  componentWillUnmount() {
    window.removeEventListener('user-login', this.init);
    window.removeEventListener('account-deleted', this.init);
  }

  init = () => {
    const { match, history, intl } = this.props;
    const { username } = match.params;
    let { asset } = match.params;
    const { mode } = this.props;

    if (mode === 'power-up') {
      asset = 'STEEM';
    }

    const { accounts } = this.props;
    const account = accounts.find(x => x.username === username);

    if (!account) {
      history.push('/');
      return;
    }

    if (account.type === 's' && !account.keys.active) {
      this.setState({
        fromError: intl.formatMessage({ id: 'transfer.key-required-err' })
      });
    } else {
      this.setState({ fromError: null });
    }

    this.setState(
      {
        from: username,
        asset: asset.toUpperCase()
      },
      () => {
        this.fetchFromData();
      }
    );

    // auto fill
    if (['transfer-saving', 'withdraw-saving', 'power-up'].includes(mode)) {
      this.toChanged(username);
    }
  };

  fetchFromData = () => {
    const { from } = this.state;

    return getAccount(from)
      .then(account =>
        getPoints(from).then(r =>
          Object.assign({}, account, { points: r.points })
        )
      )
      .then(account => {
        this.setState({ fromData: account }, () => {
          this.checkAmount();
        });

        return account;
      })
      .catch(e => {
        message.error(formatChainError(e));
      });
  };

  resetState = () => {
    this.recentDb = getRecentTransfers();

    return {
      step: 1,
      from: null,
      fromData: null,
      fromError: null,
      to: null,
      toData: null,
      toError: null,
      toWarning: null,
      amount: '0.001',
      amountError: null,
      balance: '0',
      asset: 'STEEM',
      memo: '',
      inProgress: false,
      recentList: this.recentDb
    };
  };

  assetChanged = asset => {
    this.setState({ asset }, () => {
      this.checkAmount();
    });
  };

  fromChanged = from => {
    const { mode, history } = this.props;
    const { asset } = this.state;

    let u = '/';
    switch (mode) {
      case 'transfer':
        u = `/@${from}/transfer/${asset.toLowerCase()}`;
        break;
      case 'transfer-saving':
        u = `/@${from}/transfer-saving/${asset.toLowerCase()}`;
        break;
      case 'withdraw-saving':
        u = `/@${from}/withdraw-saving/${asset.toLowerCase()}`;
        break;
      case 'power-up':
        u = `/@${from}/withdraw-saving`;
        break;
      default:
        break;
    }

    history.push(u);
  };

  toChanged = to => {
    this.setState({ to });

    if (this.timer) {
      clearTimeout(this.timer);
    }

    const recentList = to
      ? this.recentDb.filter(x => x.indexOf(to) !== -1)
      : this.recentDb;
    this.setState({ recentList });

    const { intl } = this.props;

    this.timer = setTimeout(() => {
      if (badActors.includes(to)) {
        this.setState({
          toWarning: intl.formatMessage({ id: 'transfer.to-bad-actor' })
        });
      } else {
        this.setState({ toWarning: null });
      }

      this.setState({ inProgress: true, toData: null });

      return getAccount(to)
        .then(resp => {
          if (resp) {
            this.setState({ toError: null, toData: resp });
          } else {
            this.setState({
              toError: intl.formatMessage({ id: 'transfer.to-not-found' })
            });
          }

          return resp;
        })
        .catch(err => {
          message.error(formatChainError(err));
        })
        .finally(() => {
          this.setState({ inProgress: false });
        });
    }, 500);
  };

  amountChanged = e => {
    const { value: amount } = e.target;
    this.setState({ amount }, () => {
      this.checkAmount();
    });
  };

  checkAmount = () => {
    const { intl } = this.props;
    const { amount } = this.state;

    if (!amountFormatCheck(amount)) {
      this.setState({
        amountError: intl.formatMessage({ id: 'transfer.wrong-amount' })
      });
      return;
    }

    const dotParts = amount.split('.');
    if (dotParts.length > 1) {
      const precision = dotParts[1];
      if (precision.length > 3) {
        this.setState({
          amountError: intl.formatMessage({
            id: 'transfer.amount-precision-error'
          })
        });
        return;
      }
    }

    if (parseFloat(amount) > parseFloat(this.getBalance())) {
      this.setState({
        amountError: intl.formatMessage({ id: 'transfer.insufficient-funds' })
      });

      return;
    }

    this.setState({ amountError: null });
  };

  copyBalance = () => {
    const balance = this.getBalance();
    this.setState({ amount: String(balance) });
  };

  memoChanged = e => {
    const { value: memo } = e.target;
    this.setState({ memo });
  };

  canSubmit = () => {
    const { fromError, toData, toError, amountError, inProgress } = this.state;
    return !fromError && toData && !toError && !amountError && !inProgress;
  };

  getBalance = () => {
    const { mode } = this.props;
    const { fromData, asset } = this.state;

    if (!fromData) {
      return null;
    }

    if (asset === 'ESTM') {
      return parseToken(fromData.points);
    }

    if (mode === 'withdraw-saving') {
      const k = asset === 'STEEM' ? 'savings_balance' : 'savings_sbd_balance';
      return parseToken(fromData[k]);
    }

    const k = asset === 'STEEM' ? 'balance' : 'sbd_balance';
    return parseToken(fromData[k]);
  };

  next = () => {
    // make sure 3 decimals in amount
    const { amount } = this.state;
    const fixedAmount = Number(amount).toFixed(3);

    this.setState({ step: 2, amount: fixedAmount });
  };

  back = () => {
    this.setState({ step: 1 });
  };

  confirm = pin => {
    const { accounts, mode } = this.props;
    const { from, to, amount, asset, memo } = this.state;
    const fullAmount = `${amount} ${asset}`;

    const account = accounts.find(x => x.username === from);

    let fn;
    let args = [account, pin, to, fullAmount, memo];
    switch (mode) {
      case 'transfer':
        if (asset === 'ESTM') {
          fn = transferPoint;
        } else {
          fn = transfer;
        }
        break;
      case 'transfer-saving':
        fn = transferToSavings;
        break;
      case 'withdraw-saving':
        fn = transferFromSavings;
        const requestId = new Date().getTime() >>> 0;
        args = [account, pin, requestId, to, fullAmount, memo];
        break;
      case 'power-up':
        fn = transferToVesting;
        args = [account, pin, to, fullAmount];
        break;
      default:
        return;
    }

    this.setState({ inProgress: true });
    return fn(...args)
      .then(resp => {
        this.setState({ step: 3 });

        // Save recipient to recent list
        appendToRecentTransfers(to);

        return resp;
      })
      .catch(err => {
        message.error(formatChainError(err));
      })
      .finally(() => {
        this.setState({ inProgress: false });
      });
  };

  reset = () => {
    this.setState(this.resetState(), () => {
      this.init();
    });
  };

  finish = () => {
    const { history } = this.props;
    const { from } = this.state;
    const l = `/@${from}/wallet`;
    history.push(l);
  };

  render() {
    const { intl, accounts, mode } = this.props;

    const {
      step,
      from,
      fromData,
      fromError,
      to,
      toError,
      toWarning,
      amount,
      amountError,
      asset,
      memo,
      inProgress,
      recentList
    } = this.state;

    const balance = this.getBalance();

    const options =
      recentList && recentList.length > 0
        ? [
            <AutoComplete.OptGroup
              key="recent"
              label={intl.formatMessage({
                id: 'transfer.recent-transfers'
              })}
            >
              {recentList.map(item => (
                <AutoComplete.Option key={item} value={item}>
                  {item}
                </AutoComplete.Option>
              ))}
            </AutoComplete.OptGroup>
          ]
        : [];

    return (
      <div className="wrapper">
        <NavBar
          {...Object.assign({}, this.props, {
            reloadFn: () => {
              this.setState(this.resetState());
              this.init();
            },
            reloading: !fromData || inProgress
          })}
        />

        {fromData && (
          <div className="app-content transfer-page">
            {step === 1 && (
              <div
                className={`transfer-box ${inProgress ? 'in-progress' : ''}`}
              >
                <div className="transfer-box-header">
                  <div className="step-no">1</div>
                  <div className="box-titles">
                    <div className="main-title">
                      {mode === 'transfer' && (
                        <FormattedMessage id="transfer.transfer-title" />
                      )}
                      {mode === 'transfer-saving' && (
                        <FormattedMessage id="transfer.transfer-saving-title" />
                      )}
                      {mode === 'withdraw-saving' && (
                        <FormattedMessage id="transfer.withdraw-saving-title" />
                      )}
                      {mode === 'power-up' && (
                        <FormattedMessage id="transfer.power-up-title" />
                      )}
                    </div>
                    <div className="sub-title">
                      {mode === 'transfer' && (
                        <FormattedMessage id="transfer.transfer-sub-title" />
                      )}
                      {mode === 'transfer-saving' && (
                        <FormattedMessage id="transfer.transfer-saving-sub-title" />
                      )}
                      {mode === 'withdraw-saving' && (
                        <FormattedMessage id="transfer.withdraw-saving-sub-title" />
                      )}
                      {mode === 'power-up' && (
                        <FormattedMessage id="transfer.power-up-sub-title" />
                      )}
                    </div>
                  </div>
                </div>
                {inProgress && <LinearProgress />}
                <div className="transfer-box-body">
                  <div className="transfer-form">
                    <div
                      className={`form-item ${fromError ? 'has-error' : ''}`}
                    >
                      <div className="form-label">
                        <FormattedMessage id="transfer.from" />
                      </div>
                      <div className="form-input">
                        <Select
                          className="select-from"
                          onChange={this.fromChanged}
                          defaultValue={from}
                          value={from}
                          placeholder={intl.formatMessage({
                            id: 'transfer.from-placeholder'
                          })}
                        >
                          {accounts.map(i => (
                            <Select.Option key={i.username} value={i.username}>
                              {i.username}
                            </Select.Option>
                          ))}
                        </Select>

                        {fromError && (
                          <div className="input-help">{fromError}</div>
                        )}
                      </div>
                    </div>
                    <div
                      className={`form-item ${
                        toWarning || toError ? 'has-error' : ''
                      }`}
                    >
                      <div className="form-label">
                        <FormattedMessage id="transfer.to" />
                      </div>
                      <div className="form-input">
                        <AutoComplete
                          onChange={this.toChanged}
                          value={to}
                          placeholder={intl.formatMessage({
                            id: 'transfer.to-placeholder'
                          })}
                          spellCheck={false}
                          dataSource={options}
                        />

                        {toWarning && (
                          <div className="input-help">{toWarning}</div>
                        )}

                        {toError && <div className="input-help">{toError}</div>}
                      </div>
                    </div>
                    <div
                      className={`form-item item-amount ${
                        amountError ? 'has-error' : ''
                      }`}
                    >
                      <div className="form-label">
                        <FormattedMessage id="transfer.amount" />
                      </div>
                      <div className="form-input">
                        <Input
                          type="text"
                          value={amount}
                          className="txt-amount"
                          placeholder={intl.formatMessage({
                            id: 'transfer.amount-placeholder'
                          })}
                          onChange={this.amountChanged}
                        />
                        {amountError && (
                          <div className="input-help">{amountError}</div>
                        )}
                      </div>
                      {mode !== 'power-up' && (
                        <AssetSwitch
                          defaultSelected={asset}
                          onChange={this.assetChanged}
                        />
                      )}
                    </div>
                    <div
                      role="none"
                      className="balance"
                      onClick={this.copyBalance}
                    >
                      <FormattedMessage id="transfer.balance" />:{' '}
                      <span className="balance-num">
                        {' '}
                        {balance} {asset}
                      </span>
                    </div>
                    {mode !== 'power-up' && (
                      <div className="form-item">
                        <div className="form-label">
                          <FormattedMessage id="transfer.memo" />
                        </div>
                        <div className="form-input">
                          <Input
                            type="text"
                            value={memo}
                            placeholder={intl.formatMessage({
                              id: 'transfer.memo-placeholder'
                            })}
                            onChange={this.memoChanged}
                          />
                          <div className="input-help">
                            <FormattedMessage id="transfer.memo-help" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="form-controls">
                      <Button
                        type="primary"
                        disabled={!this.canSubmit()}
                        onClick={this.next}
                      >
                        <FormattedMessage id="transfer.next" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="transfer-box">
                <div className="transfer-box-header">
                  <div className="step-no">2</div>
                  <div className="box-titles">
                    <div className="main-title">
                      <FormattedMessage id="transfer.confirm-title" />
                    </div>
                    <div className="sub-title">
                      <FormattedMessage id="transfer.confirm-sub-title" />
                    </div>
                  </div>
                </div>
                <div className="transfer-box-body">
                  <div className="confirmation">
                    <div className="users">
                      <QuickProfile
                        {...this.props}
                        reputation={25}
                        username={from}
                      >
                        <div className="from-user">
                          <UserAvatar user={from} size="xLarge" />
                        </div>
                      </QuickProfile>
                      <div className="arrow">{arrowRight}</div>
                      <QuickProfile
                        {...this.props}
                        reputation={25}
                        username={to}
                      >
                        <div className="to-user">
                          <UserAvatar user={to} size="xLarge" />
                        </div>
                      </QuickProfile>
                    </div>

                    <div className="amount">
                      {amount} {asset}
                    </div>

                    {memo && <div className="memo">{memo}</div>}
                  </div>
                  <div className="transfer-form">
                    <div className="form-controls">
                      <a role="none" className="btn-back" onClick={this.back}>
                        <FormattedMessage id="transfer.back" />
                      </a>
                      <PinRequired {...this.props} onSuccess={this.confirm}>
                        <Button type="primary" disabled={inProgress}>
                          {inProgress && (
                            <Icon
                              type="loading"
                              style={{ fontSize: 12 }}
                              spin
                            />
                          )}
                          <FormattedMessage id="transfer.confirm" />
                        </Button>
                      </PinRequired>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div
                className={`transfer-box ${inProgress ? 'in-progress' : ''}`}
              >
                <div className="transfer-box-header">
                  <div className="step-no">3</div>
                  <div className="box-titles">
                    <div className="main-title">
                      <FormattedMessage id="transfer.success-title" />
                    </div>
                    <div className="sub-title">
                      <FormattedMessage id="transfer.success-sub-title" />
                    </div>
                  </div>
                </div>
                {inProgress && <LinearProgress />}
                <div className="transfer-box-body">
                  <div className="success">
                    <FormattedHTMLMessage
                      id="transfer.transfer-summary"
                      values={{ amount: `${amount} ${asset}`, from, to }}
                    />
                  </div>
                  <div className="transfer-form">
                    <div className="form-controls">
                      <a role="none" className="btn-back" onClick={this.reset}>
                        <FormattedMessage id="transfer.reset" />
                      </a>
                      <Button type="primary" onClick={this.finish}>
                        <FormattedMessage id="transfer.finish" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!fromData && <div className="app-content transfer-page" />}

        <AppFooter {...this.props} />
        <DeepLinkHandler {...this.props} />
      </div>
    );
  }
}

Transfer.defaultProps = {
  accounts: [],
  activeAccount: null
};

Transfer.propTypes = {
  mode: PropTypes.string.isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  accounts: PropTypes.arrayOf(PropTypes.object),
  history: PropTypes.instanceOf(Object).isRequired,
  match: PropTypes.instanceOf(Object).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default injectIntl(Transfer);
