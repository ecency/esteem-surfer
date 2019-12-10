/*
eslint-disable react/no-multi-comp
*/

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Modal, Input, Button, message } from 'antd';
import { FormattedMessage } from 'react-intl';

import { PrivateKey } from 'dsteem';

import { updatePassword } from '../../backend/steem-client';

import formatChainError from '../../utils/format-chain-error';

class Password extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      curPass: '',
      newPass: '',
      newPass2: '',
      errors: {},
      inProgress: false
    };
  }

  valueChanged = e => {
    const id = e.target.getAttribute('data-var');
    const { value } = e.target;

    this.setState({ [id]: value });
  };

  save = () => {
    const { intl, actions } = this.props;
    const { curPass, newPass, newPass2 } = this.state;

    this.setState({ errors: {} });

    if (curPass === '') {
      const m = intl.formatMessage({ id: 'password-update.error-current' });
      this.setState({ errors: { curPass: m } });
      return;
    }

    if (newPass === '') {
      const m = intl.formatMessage({ id: 'password-update.error-new' });
      this.setState({ errors: { newPass: m } });
      return;
    }

    if (newPass !== newPass2) {
      const m = intl.formatMessage({ id: 'password-update.error-new2' });
      this.setState({ errors: { newPass: m, newPass2: m } });
      return;
    }

    const { activeAccount } = this.props;

    const newPrivateKeys = {
      active: null,
      memo: null,
      owner: null,
      posting: null
    };

    const newPublicKeys = {};
    ['owner', 'active', 'posting', 'memo'].forEach(r => {
      const k = PrivateKey.fromLogin(activeAccount.username, newPass, r);
      newPrivateKeys[r] = k.toString();

      newPublicKeys[r] = k.createPublic().toString();
    });

    const ownerKey = PrivateKey.fromLogin(
      activeAccount.username,
      curPass,
      'owner'
    ).toString();
    this.setState({ inProgress: true });

    return updatePassword(activeAccount, ownerKey, newPublicKeys)
      .then(r => {
        message.success(
          intl.formatMessage({
            id: 'password-update.updated'
          })
        );

        setTimeout(() => {
          const { onUpdate } = this.props;
          onUpdate();
        }, 400);

        // Update new keys on local
        actions.addAccount(activeAccount.username, newPrivateKeys);
        actions.logIn(activeAccount.username);

        return r;
      })
      .catch(err => {
        message.error(formatChainError(err));
      })
      .finally(() => {
        this.setState({ inProgress: false });
      });
  };

  render() {
    const { curPass, newPass, newPass2, errors, inProgress } = this.state;

    return (
      <div className="password-dialog">
        <div className="password-form">
          <div className="form-item">
            <div className="form-label">
              <FormattedMessage id="password-update.cur-pass" />
            </div>
            <div className="form-input">
              <Input
                value={curPass}
                onChange={this.valueChanged}
                data-var="curPass"
              />
            </div>
            {errors.curPass && (
              <div className="form-error">{errors.curPass}</div>
            )}
          </div>
          <div className="form-item">
            <div className="form-label">
              <FormattedMessage id="password-update.new-pass" />
            </div>
            <div className="form-input">
              <Input
                value={newPass}
                onChange={this.valueChanged}
                data-var="newPass"
              />
            </div>
            {errors.newPass && (
              <div className="form-error">{errors.newPass}</div>
            )}
          </div>
          <div className="form-item">
            <div className="form-label">
              <FormattedMessage id="password-update.new-pass2" />
            </div>
            <div className="form-input">
              <Input
                value={newPass2}
                onChange={this.valueChanged}
                data-var="newPass2"
              />
            </div>
            {errors.newPass2 && (
              <div className="form-error">{errors.newPass2}</div>
            )}
          </div>
          <div className="form-item">
            <div className="form-input">
              <Button
                size="large"
                type="primary"
                disabled={inProgress}
                onClick={this.save}
              >
                <FormattedMessage id="g.update" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Password.propTypes = {
  intl: PropTypes.instanceOf(Object).isRequired,
  activeAccount: PropTypes.instanceOf(Object).isRequired,
  onUpdate: PropTypes.func.isRequired,
  actions: PropTypes.shape({
    addAccount: PropTypes.func.isRequired,
    logIn: PropTypes.func.isRequired
  }).isRequired
};

class PasswordModal extends PureComponent {
  render() {
    const { intl, visible, onCancel } = this.props;

    return (
      <Modal
        visible={visible}
        footer={false}
        width="550px"
        onCancel={onCancel}
        destroyOnClose
        centered
        title={intl.formatMessage({ id: 'password-update.title' })}
      >
        <Password {...this.props} />
      </Modal>
    );
  }
}

PasswordModal.defaultProps = {
  onCancel: () => {},
  onUpdate: () => {}
};

PasswordModal.propTypes = {
  intl: PropTypes.instanceOf(Object).isRequired,
  account: PropTypes.instanceOf(Object).isRequired,
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func,
  onUpdate: PropTypes.func
};

export default PasswordModal;
