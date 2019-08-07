/*
eslint-disable react/no-multi-comp
*/

import React, { Fragment, PureComponent } from 'react';
import {
  FormattedHTMLMessage,
  FormattedNumber,
  FormattedMessage,
  FormattedDate,
  injectIntl
} from 'react-intl';

import PropTypes from 'prop-types';
import {
  Slider,
  AutoComplete,
  Table,
  Select,
  Button,
  Icon,
  Alert,
  message
} from 'antd';
import NavBar from './layout/NavBar';
import AppFooter from './layout/AppFooter';
import PinRequired from './helpers/PinRequired';
import QuickProfile from './helpers/QuickProfile';
import UserAvatar from './elements/UserAvatar';
import LinearProgress from './common/LinearProgress';
import DeepLinkHandler from './helpers/DeepLinkHandler';

import WithdrawRouteModal from './dialogs/WithdrawRoute';

import {
  getRecentTransfers,
  appendToRecentTransfers
} from '../helpers/storage';

import {
  getAccount,
  delegateVestingShares,
  withdrawVesting,
  setWithdrawVestingRoute,
  getWithdrawRoutes
} from '../backend/steem-client';
import formatChainError from '../utils/format-chain-error';
import parseToken from '../utils/parse-token';
import parseDate from '../utils/parse-date';
import isEmptyDate from '../utils/is-empty-date';

import badActors from '../data/bad-actors.json';
import { arrowRight, arrowDown } from '../svg';

import { vestsToSp } from '../utils/conversions';
import formatVest from '../utils/format-vest';
import SliderTooltip from './elements/SliderTooltip';

class DelegateCls extends PureComponent {
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
        from: username
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
      amount: 0,
      balance: '0',
      memo: '',
      inProgress: false,
      recentList: this.recentDb
    };
  };

  fromChanged = from => {
    const { history } = this.props;
    const u = `/@${from}/delegate`;
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

  amountChanged = amount => {
    this.setState({ amount });
  };

  canSubmit = () => {
    const { fromError, toData, toError, inProgress } = this.state;
    return !fromError && toData && !toError && !inProgress;
  };

  next = () => {
    this.setState({ step: 2 });
  };

  back = () => {
    this.setState({ step: 1 });
  };

  confirm = pin => {
    const { accounts } = this.props;
    const { from, to, amount } = this.state;
    const fullAmount = `${amount}.000000 VESTS`;

    const account = accounts.find(x => x.username === from);

    this.setState({ inProgress: true });
    return delegateVestingShares(account, pin, to, fullAmount)
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
    const { intl, accounts, dynamicProps } = this.props;
    const { steemPerMVests } = dynamicProps;

    const {
      step,
      from,
      fromData,
      fromError,
      to,
      toError,
      toWarning,
      amount,
      inProgress,
      recentList
    } = this.state;

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

    let availableVestingShares = 0;
    if (fromData) {
      if (!isEmptyDate(fromData.next_vesting_withdrawal)) {
        // powering down
        availableVestingShares =
          parseToken(fromData.vesting_shares) -
          (Number(fromData.to_withdraw) - Number(fromData.withdrawn)) / 1e6 -
          parseToken(fromData.delegated_vesting_shares);
      } else {
        // not powering down
        availableVestingShares =
          parseToken(fromData.vesting_shares) -
          parseFloat(fromData.delegated_vesting_shares);
      }
    }

    const sliderPerc = Math.ceil((amount / availableVestingShares) * 100);

    return (
      <div className="wrapper">
        <NavBar
          postBtnActive
          {...Object.assign({}, this.props, {
            reloadFn: () => {
              this.setState(this.resetState());
              this.init();
            },
            reloading: !fromData || inProgress
          })}
        />

        {fromData && (
          <div className="app-content delegate-page">
            {step === 1 && (
              <div
                className={`transfer-box ${inProgress ? 'in-progress' : ''}`}
              >
                <div className="transfer-box-header">
                  <div className="step-no">1</div>
                  <div className="box-titles">
                    <div className="main-title">
                      <FormattedMessage id="delegate.title" />
                    </div>
                    <div className="sub-title">
                      <FormattedMessage id="delegate.sub-title" />
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
                          className="to-input"
                          onChange={this.toChanged}
                          value={to}
                          placeholder={intl.formatMessage({
                            id: 'transfer.to-placeholder'
                          })}
                          spellCheck={false}
                          dataSource={options}
                          dropdownStyle={{ zIndex: 1070 }}
                        />
                        {toWarning && (
                          <div className="input-help">{toWarning}</div>
                        )}
                        {toError && <div className="input-help">{toError}</div>}
                      </div>
                    </div>
                    <div className="form-item vesting-amount">
                      <div className="form-label">
                        <FormattedMessage id="transfer.amount" />
                      </div>
                      <div className="form-input">
                        <SliderTooltip
                          percentage={sliderPerc}
                          value={`${amount}.000000 VESTS`}
                        />
                        <Slider
                          step={1}
                          max={availableVestingShares}
                          tooltipVisible={false}
                          value={amount}
                          onChange={this.amountChanged}
                          disabled={availableVestingShares < 1}
                        />
                        <div className="input-help">
                          <FormattedMessage id="delegate.slider-help" />
                        </div>

                        {availableVestingShares < 1 && (
                          <Alert
                            type="error"
                            message={intl.formatMessage(
                              { id: 'delegate.insufficient-vesting' },
                              { a: availableVestingShares }
                            )}
                          />
                        )}
                      </div>
                    </div>
                    <div className="steem-power">
                      {amount > 0 && (
                        <Fragment>
                          <FormattedNumber
                            minimumFractionDigits={3}
                            value={vestsToSp(amount, steemPerMVests)}
                          />{' '}
                          {'SP'}
                        </Fragment>
                      )}
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
                      <FormattedMessage id="delegate.confirm-title" />
                    </div>
                    <div className="sub-title">
                      <FormattedMessage id="delegate.confirm-sub-title" />
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
                    <div className="amount-sp">
                      <FormattedNumber
                        minimumFractionDigits={3}
                        value={vestsToSp(amount, steemPerMVests)}
                      />{' '}
                      {'SP'}
                    </div>
                    <div className="amount-vest">
                      {`${amount}.000000 VESTS`}
                    </div>
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
                      <FormattedMessage id="delegate.success-sub-title" />
                    </div>
                  </div>
                </div>
                {inProgress && <LinearProgress />}
                <div className="transfer-box-body">
                  <div className="success">
                    <FormattedHTMLMessage
                      id="delegate.delegation-summary"
                      values={{
                        sp: `${intl.formatNumber(
                          vestsToSp(amount, steemPerMVests)
                        )} SP`,
                        to
                      }}
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

DelegateCls.defaultProps = {
  accounts: []
};

DelegateCls.propTypes = {
  dynamicProps: PropTypes.instanceOf(Object).isRequired,
  accounts: PropTypes.arrayOf(PropTypes.object),
  history: PropTypes.instanceOf(Object).isRequired,
  match: PropTypes.instanceOf(Object).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

const Delegate = injectIntl(DelegateCls);

export { Delegate };

class PowerDownCls extends PureComponent {
  constructor(props) {
    super(props);

    this.state = this.resetState();
  }

  componentDidMount() {
    this.init();

    window.addEventListener('user-login', this.init);
  }

  componentWillUnmount() {
    window.removeEventListener('user-login', this.init);
  }

  init = () => {
    const { match, history, intl } = this.props;
    const { username } = match.params;

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
        from: username
      },
      () => {
        this.fetchFromData();
        this.fetchRoutes();
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

  fetchRoutes = () => {
    const { from } = this.state;

    return getWithdrawRoutes(from)
      .then(resp => {
        this.setState({ routes: resp });
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
    amount: 0,
    routes: [],
    inProgress: false,
    accountWindowVisible: false
  });

  canSubmit = () => {
    const { fromError, amount, inProgress } = this.state;
    return !fromError && amount > 0 && !inProgress;
  };

  amountChanged = amount => {
    this.setState({ amount });
  };

  fromChanged = from => {
    const { history } = this.props;
    const u = `/@${from}/power-down`;
    history.push(u);
  };

  doWithdrawVesting = (pin, fullAmount) => {
    const { accounts } = this.props;
    const { from } = this.state;

    const account = accounts.find(x => x.username === from);

    this.setState({ inProgress: true });
    return withdrawVesting(account, pin, fullAmount)
      .then(resp => {
        this.init();
        return resp;
      })
      .catch(err => {
        message.error(formatChainError(err));
      })
      .finally(() => {
        this.setState({ inProgress: false });
      });
  };

  start = pin => {
    const { amount } = this.state;
    const fullAmount = `${amount}.000000 VESTS`;

    this.doWithdrawVesting(pin, fullAmount);
  };

  stop = pin => {
    const fullAmount = `0.000000 VESTS`;

    this.doWithdrawVesting(pin, fullAmount);
  };

  toggleWithdrawAccountWindow = () => {
    const { accountWindowVisible } = this.state;
    this.setState({ accountWindowVisible: !accountWindowVisible });
  };

  deleteRoute = (pin, to) => {
    const { accounts } = this.props;
    const { from } = this.state;

    const account = accounts.find(x => x.username === from);

    this.setState({ inProgress: true });
    return setWithdrawVestingRoute(account, pin, to, 0, false)
      .then(() => this.fetchRoutes())
      .catch(err => {
        message.error(formatChainError(err));
      })
      .finally(() => {
        this.setState({ inProgress: false });
      });
  };

  render() {
    const { intl, accounts, dynamicProps } = this.props;
    const { steemPerMVests } = dynamicProps;

    const {
      from,
      fromData,
      fromError,
      amount,
      routes,
      inProgress,
      accountWindowVisible
    } = this.state;

    let poweringDown = false;
    let availableVestingShares = 0;
    let poweringDownVests = 0;
    let nextPowerDown = null;

    if (fromData) {
      poweringDown = !isEmptyDate(fromData.next_vesting_withdrawal);
      nextPowerDown = parseDate(fromData.next_vesting_withdrawal);

      if (poweringDown) {
        poweringDownVests = parseToken(fromData.vesting_withdraw_rate);
      } else {
        availableVestingShares =
          parseToken(fromData.vesting_shares) -
          (Number(fromData.to_withdraw) - Number(fromData.withdrawn)) / 1e6 -
          parseToken(fromData.delegated_vesting_shares);
      }
    }

    const spCalculated = vestsToSp(amount, steemPerMVests);
    const vests = formatVest(parseToken(amount));
    const fundPerWeek = Math.round((spCalculated / 13) * 1000) / 1000;

    const poweringDownFund = vestsToSp(poweringDownVests, steemPerMVests);

    const routeTableColumns = [
      {
        title: 'Account',
        dataIndex: 'to_account',
        key: 'to_account'
      },
      {
        title: 'Percent',
        dataIndex: 'percent',
        key: 'percent',
        render: x => `${x / 100}%`
      },
      {
        title: 'Auto Vest',
        dataIndex: 'auto_vest',
        key: 'auto_vest',
        render: (x, rec) => (rec.auto_vest ? 'VEST' : 'STEEM')
      },
      {
        render: (x, rec) => (
          <PinRequired
            {...this.props}
            onSuccess={pin => {
              this.deleteRoute(pin, rec.to_account);
            }}
          >
            <Button
              disabled={inProgress}
              type="danger"
              size="small"
              icon="delete"
            />
          </PinRequired>
        )
      }
    ];

    const sliderPerc = Math.ceil((amount / availableVestingShares) * 100);

    return (
      <div className="wrapper">
        <NavBar
          postBtnActive
          {...Object.assign({}, this.props, {
            reloadFn: () => {
              this.setState(this.resetState());
              this.init();
            },
            reloading: !fromData || inProgress
          })}
        />
        {fromData && (
          <div className="app-content power-down-page">
            <div className={`transfer-box ${inProgress ? 'in-progress' : ''}`}>
              <div className="transfer-box-header">
                <div className="box-titles">
                  <div className="main-title">
                    <FormattedMessage id="power-down.title" />
                  </div>
                  <div className="sub-title">
                    <FormattedMessage id="power-down.sub-title" />
                  </div>
                </div>
              </div>
              {inProgress && <LinearProgress />}
              <div className="transfer-box-body">
                <div className="transfer-form">
                  <div className={`form-item ${fromError ? 'has-error' : ''}`}>
                    <div className="form-label">
                      <FormattedMessage id="power-down.account" />
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

                  <div className="form-item">
                    <div className="form-label">
                      <FormattedMessage id="power-down.withdraw-accounts" />
                    </div>
                    <div className="form-input">
                      {routes.length > 0 && (
                        <Table
                          className="routes-table"
                          dataSource={routes}
                          columns={routeTableColumns}
                          showHeader={false}
                          pagination={false}
                        />
                      )}

                      <Button
                        type="primary"
                        onClick={this.toggleWithdrawAccountWindow}
                      >
                        <FormattedMessage id="power-down.add-withdraw-account" />
                      </Button>
                    </div>
                  </div>

                  <WithdrawRouteModal
                    {...this.props}
                    from={from}
                    visible={accountWindowVisible}
                    onSuccess={() => {
                      this.toggleWithdrawAccountWindow();
                      this.fetchRoutes();
                    }}
                    onCancel={() => {
                      this.toggleWithdrawAccountWindow();
                    }}
                  />

                  {!poweringDown && (
                    <Fragment>
                      <div className="form-item vesting-amount">
                        <div className="form-label">
                          <FormattedMessage id="transfer.amount" />
                        </div>
                        <div className="form-input">
                          <SliderTooltip
                            percentage={sliderPerc}
                            value={`${amount}.000000 VESTS`}
                          />

                          <Slider
                            step={1}
                            max={availableVestingShares}
                            tooltipVisible={false}
                            value={amount}
                            onChange={this.amountChanged}
                            disabled={availableVestingShares < 1}
                          />
                          <div className="input-help slider-note">
                            <FormattedMessage id="delegate.slider-help" />
                          </div>

                          {availableVestingShares < 1 && (
                            <Alert
                              type="error"
                              message={intl.formatMessage(
                                { id: 'delegate.insufficient-vesting' },
                                { a: availableVestingShares }
                              )}
                            />
                          )}
                        </div>
                      </div>
                      <div className="numbers">
                        <div className="first-row">
                          <div className="sp-num">
                            {'-'} {spCalculated.toFixed(3)} SP
                          </div>
                          <div className="vests-num">
                            {'-'} {vests} VESTS
                          </div>
                        </div>
                        <div className="arrow-row">{arrowDown}</div>
                        <div className="second-row">
                          <div className="steem-num">
                            {'+'} {fundPerWeek.toFixed(3)} STEEM
                          </div>
                          <div className="estimated-note">
                            <FormattedMessage id="power-down.estimated-note" />
                          </div>
                        </div>
                      </div>
                      <div className="form-controls">
                        <PinRequired {...this.props} onSuccess={this.start}>
                          <Button
                            type="primary"
                            disabled={!this.canSubmit()}
                            size="large"
                          >
                            {inProgress && (
                              <Icon
                                type="loading"
                                style={{ fontSize: 12 }}
                                spin
                              />
                            )}
                            <FormattedMessage id="power-down.begin" />
                          </Button>
                        </PinRequired>
                      </div>
                    </Fragment>
                  )}
                  {poweringDown && (
                    <Fragment>
                      <div className="form-item">
                        <div className="form-label">
                          <FormattedMessage id="power-down.incoming-funds" />
                        </div>
                        <div className="form-input incoming-funds">
                          <span className="steem">
                            + {poweringDownFund.toFixed(3)} STEEM
                          </span>
                          <span className="vests">
                            - {formatVest(poweringDownVests)} VESTS
                          </span>
                          <span className="next-date">
                            {'@'}{' '}
                            <FormattedDate
                              month="long"
                              day="2-digit"
                              year="numeric"
                              hour="numeric"
                              minute="numeric"
                              value={nextPowerDown}
                            />
                          </span>
                        </div>
                      </div>

                      <div className="form-controls">
                        <PinRequired {...this.props} onSuccess={this.stop}>
                          <Button type="danger" size="large">
                            {inProgress && (
                              <Icon
                                type="loading"
                                style={{ fontSize: 12 }}
                                spin
                              />
                            )}
                            <FormattedMessage id="power-down.stop" />
                          </Button>
                        </PinRequired>
                      </div>
                    </Fragment>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {!fromData && <div className="app-content power-down-page" />}

        <AppFooter {...this.props} />
        <DeepLinkHandler {...this.props} />
      </div>
    );
  }
}

PowerDownCls.defaultProps = {
  accounts: []
};

PowerDownCls.propTypes = {
  dynamicProps: PropTypes.instanceOf(Object).isRequired,
  accounts: PropTypes.arrayOf(PropTypes.object),
  history: PropTypes.instanceOf(Object).isRequired,
  match: PropTypes.instanceOf(Object).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

const PowerDown = injectIntl(PowerDownCls);
export { PowerDown };
