/*
eslint-disable react/no-multi-comp
*/

import React, { PureComponent } from 'react';
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl';

import PropTypes from 'prop-types';
import { Input, Select, Button, Icon, message } from 'antd';
import NavBar from './layout/NavBar';
import AppFooter from './layout/AppFooter';
import PinRequired from './helpers/PinRequired';
import QuickProfile from './helpers/QuickProfile';
import UserAvatar from './elements/UserAvatar';
import LinearProgress from './common/LinearProgress';
import DeepLinkHandler from './helpers/DeepLinkHandler';

import { getAccount, transfer } from '../backend/steem-client';
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
  }

  init = () => {
    const { match, history, intl } = this.props;
    const { username, asset } = match.params;

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
  };

  fetchFromData = () => {
    const { from } = this.state;

    return getAccount(from)
      .then(resp => {
        this.setState({ fromData: resp });
        return resp;
      })
      .catch(e => {
        message.error(formatChainError(e));
      });
  };

  resetState = () => ({
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
    inProgress: false
  });

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
        u = `/@${from}/transfer/${asset}`;
        break;
      case 'transfer-saving':
        u = `/@${from}/transfer-saving/${asset}`;
        break;
      default:
        break;
    }

    history.push(u);
  };

  toChanged = e => {
    const { inProgress } = this.state;
    if (inProgress) {
      return;
    }

    if (this.timer) {
      clearTimeout(this.timer);
    }

    const { intl } = this.props;
    const { value: to } = e.target;

    this.setState({ to });

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

    if (mode === 'from-savings') {
      const k = asset === 'STEEM' ? 'savings_balance' : 'savings_sbd_balance';
      return parseToken(fromData[k]);
    }

    const k = asset === 'STEEM' ? 'balance' : 'sbd_balance';
    return parseToken(fromData[k]);
  };

  next = () => {
    this.setState({ step: 2 });
  };

  back = () => {
    this.setState({ step: 1 });
  };

  confirm = pin => {
    const { accounts } = this.props;
    const { from, to, amount, asset, memo } = this.state;
    const fullAmount = `${amount} ${asset}`;

    const account = accounts.find(x => x.username === from);

    this.setState({ inProgress: true });
    return transfer(account, pin, to, fullAmount, memo)
      .then(resp => {
        this.setState({ step: 3 });
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
    this.setState(this.resetState());
  };

  finish = () => {
    const { history } = this.props;
    const { from } = this.state;
    const l = `/@${from}/wallet`;
    history.push(l);
  };

  render() {
    const { intl, accounts } = this.props;

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
      inProgress
    } = this.state;

    const balance = this.getBalance();

    const loading = false;

    return (
      <div className="wrapper">
        <NavBar
          {...Object.assign({}, this.props, {
            reloadFn: () => {
              this.refresh();
            },
            reloading: loading
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
                      <FormattedMessage id="transfer.transfer-title" />
                    </div>
                    <div className="sub-title">
                      <FormattedMessage id="transfer.transfer-sub-title" />
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
                        <Input
                          type="text"
                          onChange={this.toChanged}
                          value={to}
                          placeholder={intl.formatMessage({
                            id: 'transfer.to-placeholder'
                          })}
                          spellCheck={false}
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
                      <AssetSwitch
                        defaultSelected={asset}
                        onChange={this.assetChanged}
                      />
                    </div>
                    {balance && (
                      <div className="balance">
                        <FormattedMessage id="transfer.balance" />:{' '}
                        <span className="balance-num">
                          {' '}
                          {balance} {asset}
                        </span>
                      </div>
                    )}
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
