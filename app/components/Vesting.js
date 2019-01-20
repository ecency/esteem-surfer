/*
eslint-disable react/no-multi-comp
*/

import React, { Fragment, PureComponent } from 'react';
import {
  FormattedHTMLMessage,
  FormattedNumber,
  FormattedMessage,
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
  message
} from 'antd';
import NavBar from './layout/NavBar';
import AppFooter from './layout/AppFooter';
import PinRequired from './helpers/PinRequired';
import QuickProfile from './helpers/QuickProfile';
import UserAvatar from './elements/UserAvatar';
import LinearProgress from './common/LinearProgress';
import DeepLinkHandler from './helpers/DeepLinkHandler';
import AccountLink from './helpers/AccountLink';

import { getItem, setItem } from '../helpers/storage';

import {
  getAccount,
  delegateVestingShares,
  getVestingDelegations
} from '../backend/steem-client';
import formatChainError from '../utils/format-chain-error';
import parseToken from '../utils/parse-token';
import isEmptyDate from '../utils/is-empty-date';

import badActors from '../data/bad-actors.json';
import { arrowRight } from '../svg';

import { vestsToSp } from '../utils/conversions';

class DelegateCls extends PureComponent {
  constructor(props) {
    super(props);

    this.state = this.resetState();
    this.timer = null;
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
    this.recentDb = getItem('recent-transfers', []);

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
        const recent = getItem('recent-transfers', []);
        if (!recent.includes(to)) {
          const newRecent = [...new Set([to, ...recent])].slice(0, 100);
          setItem('recent-transfers', newRecent);
        }

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

    return (
      <div className="wrapper">
        <NavBar
          {...Object.assign({}, this.props, {
            reloadFn: () => {},
            reloading: false
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
                    <div className="form-item" style={{ marginTop: '50px' }}>
                      <div className="form-label">
                        <FormattedMessage id="transfer.amount" />
                      </div>
                      <div className="form-input">
                        <Slider
                          step={1}
                          max={availableVestingShares}
                          tipFormatter={a => `${a}.000000 VESTS`}
                          tooltipVisible
                          value={amount}
                          onChange={this.amountChanged}
                        />
                        <div className="input-help">
                          <FormattedMessage id="delegate.slider-help" />
                        </div>
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

class DelegationListCls extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      list: []
    };
  }

  componentDidMount() {
    this.load();
  }

  load = () => {
    const { username } = this.props;

    return getVestingDelegations(username)
      .then(resp => {
        this.setState({ list: resp });
        return resp;
      })
      .catch(e => {
        message.error(formatChainError(e));
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  undelegate = (pin, delegatee) => {
    const { activeAccount } = this.props;
    if (activeAccount.type === 's' && !activeAccount.keys.active) {
      message.error('Active key required!');
      return;
    }

    return delegateVestingShares(
      activeAccount,
      pin,
      delegatee,
      '0.000000 VESTS'
    )
      .then(resp => {
        this.load();
        return resp;
      })
      .catch(e => {
        message.error(formatChainError(e));
      });
  };

  render() {
    const { list, loading } = this.state;

    const { dynamicProps, activeAccount, username } = this.props;
    const { steemPerMVests } = dynamicProps;

    if (loading) {
      return (
        <div className="delegate-modal-table">
          <LinearProgress />
        </div>
      );
    }

    const dataSource = list.map((i, k) => ({
      key: k,
      delegatee: i.delegatee,
      vesting_shares: i.vesting_shares
    }));

    const columns = [
      {
        title: null,
        dataIndex: 'delegatee',
        key: 'delegatee',
        render: value => (
          <AccountLink {...this.props} username={value}>
            <a>{value}</a>
          </AccountLink>
        )
      },
      {
        title: null,
        dataIndex: 'vesting_shares',
        key: 'vesting_shares',
        render: value => (
          <Fragment>
            <FormattedNumber
              value={vestsToSp(parseToken(value), steemPerMVests)}
              minimumFractionDigits={3}
            />{' '}
            {'SP'} <br />
            <small>{value}</small>
          </Fragment>
        )
      },
      {
        title: null,
        dataIndex: 'undelegate',
        key: 'undelegate',
        render: (value, record) => {
          if (activeAccount.username === username) {
            return (
              <PinRequired
                {...this.props}
                onSuccess={pin => {
                  this.undelegate(pin, record.delegatee);
                }}
              >
                <span className="btn-delete">
                  <i className="mi">delete_forever</i>
                </span>
              </PinRequired>
            );
          }

          return '';
        }
      }
    ];

    return (
      <div className="delegate-modal-table">
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          showHeader={false}
        />
      </div>
    );
  }
}

DelegationListCls.defaultProps = {
  activeAccount: null
};

DelegationListCls.propTypes = {
  username: PropTypes.string.isRequired,
  dynamicProps: PropTypes.shape({
    steemPerMVests: PropTypes.number.isRequired
  }).isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  intl: PropTypes.instanceOf(Object).isRequired
};

const DelegationList = injectIntl(DelegationListCls);
export { DelegationList };

export class PowerDown extends PureComponent {}

export class PowerDownTargetList extends PureComponent {}
