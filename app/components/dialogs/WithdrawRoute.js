/*
eslint-disable react/no-multi-comp
*/

import React, { Fragment, PureComponent } from 'react';

import { FormattedMessage } from 'react-intl';

import PropTypes from 'prop-types';

import { AutoComplete, Button, Checkbox, message, Modal, Slider } from 'antd';

import PinRequired from '../helpers/PinRequired';
import LinearProgress from '../common/LinearProgress';
import SliderTooltip from '../elements/SliderTooltip';

import {
  getAccount,
  setWithdrawVestingRoute
} from '../../backend/steem-client';
import {
  appendToRecentTransfers,
  getRecentTransfers
} from '../../helpers/storage';

import formatChainError from '../../utils/format-chain-error';

import badActors from '../../data/bad-actors';

class WithdrawRouteDialog extends PureComponent {
  constructor(props) {
    super(props);

    this.state = this.resetState();
    this.timer = null;
  }

  resetState = () => {
    this.recentDb = getRecentTransfers();

    return {
      to: null,
      toData: null,
      toError: null,
      toWarning: null,
      percentage: 25,
      autoVest: false,
      inProgress: false,
      recentList: this.recentDb
    };
  };

  autoVestChanged = e => {
    this.setState({ autoVest: e.target.checked });
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

  percentageChanged = percentage => {
    this.setState({ percentage });
  };

  canSubmit = () => {
    const { toData, toError, inProgress, percentage } = this.state;
    return toData && !toError && !inProgress && percentage > 0;
  };

  submit = pin => {
    const { accounts, from } = this.props;
    const { to, percentage, autoVest } = this.state;

    const account = accounts.find(x => x.username === from);

    this.setState({ inProgress: true });
    return setWithdrawVestingRoute(account, pin, to, percentage * 100, autoVest)
      .then(resp => {
        // Add target account to recent transfers
        appendToRecentTransfers(to);

        const { onSuccess } = this.props;
        onSuccess();
        return resp;
      })
      .catch(err => {
        message.error(formatChainError(err));
      })
      .finally(() => {
        this.setState({ inProgress: false });
      });
  };

  render() {
    const { intl } = this.props;

    const {
      to,
      toError,
      toWarning,
      percentage,
      autoVest,
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

    return (
      <Fragment>
        {inProgress && <LinearProgress />}
        <div className="withdraw-route-dialog-content">
          <div className="transfer-form">
            <div
              className={`form-item ${toWarning || toError ? 'has-error' : ''}`}
            >
              <div className="form-label">
                <FormattedMessage id="withdraw-route.to" />
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
                {toWarning && <div className="input-help">{toWarning}</div>}
                {toError && <div className="input-help">{toError}</div>}
              </div>
            </div>
            <div className="form-item percentage">
              <div className="form-label">
                <FormattedMessage id="withdraw-route.percentage" />
              </div>
              <div className="form-input">
                <SliderTooltip percentage={percentage} />
                <Slider
                  step={1}
                  max={100}
                  tooltipVisible={false}
                  value={percentage}
                  onChange={this.percentageChanged}
                  marks={{
                    0: '',
                    25: '',
                    50: '',
                    75: '',
                    100: ''
                  }}
                />
                <div className="input-help">
                  <FormattedMessage id="withdraw-route.slider-help" />
                </div>
              </div>
            </div>
            <div className="form-item">
              <div className="form-label" />
              <div className="form-input">
                <Checkbox value={autoVest} onChange={this.autoVestChanged}>
                  <FormattedMessage id="withdraw-route.auto-power-down" />
                </Checkbox>
              </div>
            </div>
            <div className="form-controls">
              <PinRequired {...this.props} onSuccess={this.submit}>
                <Button type="primary" disabled={!this.canSubmit()}>
                  <FormattedMessage id="g.save" />
                </Button>
              </PinRequired>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

WithdrawRouteDialog.defaultProps = {
  accounts: [],
  onSuccess: () => {}
};

WithdrawRouteDialog.propTypes = {
  intl: PropTypes.instanceOf(Object).isRequired,
  from: PropTypes.string.isRequired,
  accounts: PropTypes.arrayOf(PropTypes.object),
  onSuccess: PropTypes.func
};

export default class WithdrawRouteModal extends PureComponent {
  render() {
    const { intl, visible, onCancel } = this.props;

    return (
      <Modal
        visible={visible}
        footer={false}
        width="550px"
        destroyOnClose
        onCancel={onCancel}
        centered
        title={intl.formatMessage({ id: 'withdraw-route.title' })}
      >
        <WithdrawRouteDialog {...this.props} />
      </Modal>
    );
  }
}

WithdrawRouteModal.defaultProps = {
  onSuccess: () => {},
  onCancel: () => {}
};

WithdrawRouteModal.propTypes = {
  intl: PropTypes.instanceOf(Object).isRequired,
  from: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func
};
