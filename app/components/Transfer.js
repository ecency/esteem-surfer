/*
eslint-disable react/no-multi-comp
*/

import React, { Fragment, PureComponent } from 'react';
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl';
import QuickProfile from './helpers/QuickProfile';
import UserAvatar from './elements/UserAvatar';
import EntryLink from './helpers/EntryLink';
import NavBar from './layout/NavBar';
import LinearProgress from './common/LinearProgress';
import { Input, InputNumber, Select, Alert, Button, Icon, message, Modal } from 'antd';
import AppFooter from './layout/AppFooter';
import DeepLinkHandler from './helpers/DeepLinkHandler';
import PropTypes from 'prop-types';
import PinRequired from './helpers/PinRequired';


import badActors from '../data/bad-actors.json';

import { getAccount } from '../backend/steem-client';
import formatChainError from '../utils/format-chain-error';
import parseToken from '../utils/parse-token';

import { arrowRight } from '../svg';
import { getItem } from '../helpers/storage';
import PinConfirm from './dialogs/PinConfirm';

class AssetSwitch extends PureComponent {
  constructor(props) {
    super(props);

    const { defaultSelected: selected } = this.props;

    this.state = {
      selected
    };
  }

  clicked = (i) => {
    this.setState({ selected: i });
    const { onChange } = this.props;
    onChange(i);
  };

  render() {
    const { selected } = this.state;

    return (
      <div className="asset-switch">
        <a onClick={() => this.clicked('STEEM')} role="none"
           className={`asset ${selected === 'STEEM' ? 'selected' : ''}`}>STEEM</a>
        <a onClick={() => this.clicked('SBD')} role="none"
           className={`asset ${selected === 'SBD' ? 'selected' : ''}`}>SBD</a>
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

    this.state = {
      step: 1,
      from: null,
      fromData: null,
      to: null,
      toErr: '',
      toFetching: false,
      amount: '0.001',
      balance: '0',
      asset: 'STEEM',
      memot: '',
      keyRequiredErr: false,
      pinConfirmFlag: false
    };

    this.timer = null;
  }

  assetChanged = (asset) => {
    this.setState({ asset });
  };

  fromChanged = (from) => {

    this.setState({ from });

    const { accounts } = this.props;
    const account = accounts.find(x => x.username === from);

    let keyRequiredErr = false;
    if (account.type === 's' && !account.keys.active) {
      keyRequiredErr = true;
    }

    this.setState({ keyRequiredErr });

    if (keyRequiredErr) {
      this.setState({ fromData: null });
      return;
    }

    if (!keyRequiredErr) {
      const { inProgress } = this.state;
      if (inProgress) {
        return;
      }

      this.setState({ inProgress: true });

      return getAccount(from).then(resp => {
        this.setState({ fromData: resp });
        return resp;
      }).catch(e => {
        message.error(formatChainError(e));
      }).finally(() => {
        this.setState({ inProgress: false });
      });
    }
  };

  toChanged = (e) => {

    const { inProgress } = this.state;
    if (inProgress) {
      return;
    }

    if (this.timer) {
      clearTimeout(this.timer);
    }

    const { intl } = this.props;
    const { value: to } = e.target;

    if (badActors.includes(to)) {
      const msg = intl.formatMessage({ id: 'transfer.to-bad-actor' });
      this.setState({ to: null, toErr: msg });
      return;
    }


    this.timer = setTimeout(() => {
      this.setState({ inProgress: true });
      return getAccount(to).then(resp => {

        if (resp) {
          this.setState({ to, toErr: null });
        } else {
          const msg = intl.formatMessage({ id: 'transfer.to-not-found' });
          this.setState({ to: null, toErr: msg });
        }

        return resp;
      }).catch(err => {
        message.error(formatChainError(err));
      }).finally(() => {
        this.setState({ inProgress: false });
      });

    }, 300);
  };


  amountChanged = (e) => {
    const { value: amount } = e.target;
    this.setState({ amount });
  };

  memoChanged = (e) => {
    const { value: memo } = e.target;
    this.setState({ memo });
  };

  getBalance = () => {

    /*
    if (mode === 'from_savings') {
      const k = (asset === 'STEEM' ? 'savings_balance' : 'savings_sbd_balance');
      return $scope.account[k].split(' ')[0];
    }
    */

    const { fromData, asset } = this.state;

    if (!fromData) {
      return null;
    }

    const k = (asset === 'STEEM' ? 'balance' : 'sbd_balance');
    return parseToken(fromData[k]);
  };

  next = () => {
    this.setState({ step: 2 });
  };

  back = () => {
    this.setState({ step: 1 });
  };

  confirm = () => {
    console.log('confirm');

  };

  render() {
    const { intl, activeAccount, accounts } = this.props;

    const {
      step,
      from,
      fromData,
      to,
      toErr,
      inProgress,
      amount,
      asset,
      memo,
      keyRequiredErr,
      pinConfirmFlag
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
        <div className="app-content transfer-page">
          {step === 1 &&
          <div className="transfer-box">
            <div className="transfer-box-header">
              <div className="step-no">
                1
              </div>
              <div className="box-titles">
                <div className="main-title">
                  <FormattedMessage id="transfer.transfer-title"/>
                </div>
                <div className="sub-title">
                  <FormattedMessage id="transfer.transfer-sub-title"/>
                </div>
              </div>
            </div>
            {inProgress &&
            <LinearProgress/>
            }
            <div className="transfer-box-body">
              {keyRequiredErr &&
              <div className="transfer-alert">
                <Alert
                  message={intl.formatMessage({ 'id': 'transfer.key-required-err' })}
                  type="error"
                />
              </div>
              }
              {toErr &&
              <div className="transfer-alert">
                <Alert
                  message={toErr}
                  type="error"
                />
              </div>
              }
              <div className="transfer-form">
                <div className="form-item">
                  <div className="form-label">
                    <FormattedMessage id="transfer.from"/>
                  </div>
                  <div className="form-input">
                    <Select className="select-from" onChange={this.fromChanged} defaultValue={from} value={from}
                            placeholder={intl.formatMessage({ id: 'transfer.from-placeholder' })}>
                      {accounts.map(i =>
                        <Select.Option key={i.username} value={i.username}>
                          {i.username}
                        </Select.Option>)}
                    </Select>
                  </div>
                </div>
                <div className="form-item">
                  <div className="form-label">
                    <FormattedMessage id="transfer.to"/>
                  </div>
                  <div className="form-input">
                    <Input type="text"
                           onChange={this.toChanged}
                           placeholder={intl.formatMessage({ id: 'transfer.to-placeholder' })}
                           spellCheck={false}/>
                  </div>
                </div>
                <div className="form-item item-amount">
                  <div className="form-label">
                    <FormattedMessage id="transfer.amount"/>
                  </div>
                  <div className="form-input">
                    <Input type="text" value={amount} className="txt-amount"
                           placeholder={intl.formatMessage({ id: 'transfer.amount-placeholder' })}
                           onChange={this.amountChanged}/>
                  </div>
                  <AssetSwitch defaultSelected={asset} onChange={this.assetChanged}/>
                </div>
                {balance &&
                <div className="balance">
                  <FormattedMessage id="transfer.balance"/>: <span className="balance-num"> {balance} {asset}</span>
                </div>
                }
                <div className="form-item">
                  <div className="form-label">
                    <FormattedMessage id="transfer.memo"/>
                  </div>
                  <div className="form-input">
                    <Input type="text" value={memo}
                           placeholder={intl.formatMessage({ id: 'transfer.memo-placeholder' })}
                           onChange={this.memoChanged}/>
                    <div className="input-help">
                      <FormattedMessage id="transfer.memo-help"/>
                    </div>
                  </div>
                </div>
                <div className="form-controls">
                  <Button type="primary" onClick={this.next}><FormattedMessage id="transfer.next"/></Button>
                </div>
              </div>
            </div>
          </div>
          }

          {step === 2 &&
          <div className="transfer-box">
            <div className="transfer-box-header">
              <div className="step-no">
                2
              </div>
              <div className="box-titles">
                <div className="main-title">
                  <FormattedMessage id="transfer.confirm-title"/>
                </div>
                <div className="sub-title">
                  <FormattedMessage id="transfer.confirm-sub-title"/>
                </div>
              </div>
            </div>

            <div className="transfer-box-body">
              <div className="confirmation">
                <div className="users">
                  <div className="from-user">
                    <UserAvatar user={from} size="xLarge"/>
                  </div>
                  <div className="arrow">
                    {arrowRight}
                  </div>
                  <div className="to-user">
                    <UserAvatar user={to} size="xLarge"/>
                  </div>
                </div>

                <div className="amount">
                  {amount} {asset}
                </div>

                {memo &&
                <div className="memo">{memo}</div>
                }
              </div>

              <div className="transfer-form">
                <div className="form-controls">
                  <a className="btn-back" onClick={this.back}>Back</a>
                  <PinRequired {...this.props}>
                    <Button type="primary" onClick={this.confirm}><FormattedMessage id="transfer.confirm"/></Button>
                  </PinRequired>
                </div>
              </div>
            </div>

          </div>
          }

          {step === 3 &&
          <div/>
          }


        </div>
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
  activeAccount: PropTypes.instanceOf(Object),
  accounts: PropTypes.arrayOf(PropTypes.object),
  global: PropTypes.shape({
    pin: PropTypes.string.isRequired
  }).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default injectIntl(Transfer);

