import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Col, Input, Popconfirm, Alert, message } from 'antd';
import { FormattedMessage, injectIntl } from 'react-intl';

import { pinHasher } from '../../utils/crypto';
import logo from '../../img/logo-big.png';
import defaults from '../../constants/defaults';
import { getItem, removeItem } from '../../helpers/storage';

class PinConfirm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      trys: 1
    };
  }

  componentDidMount() {
    document.addEventListener('click', this.docClicked);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.docClicked);
  }

  docClicked = e => {
    if (e.target.id !== 'pin-input') {
      document.querySelector('#pin-input').focus();
    }
  };

  handleChange = event => {
    this.setState({ value: event.target.value });
  };

  invalidate = () => {
    const { intl } = this.props;
    const { actions, onInvalidate, history } = this.props;

    history.push('/');

    setTimeout(() => {
      actions.wipePin();
      removeItem('pin-code');
      actions.logOut();
      actions.deleteAccounts();
      onInvalidate();
      message.info(intl.formatMessage({ id: 'confirm-pin-code.invalidated' }));
    }, 100);
  };

  submitForm = () => {
    const { onSuccess } = this.props;
    const { value, trys } = this.state;

    if (trys === defaults.maxPinCodeTry) {
      this.invalidate();
      return;
    }

    const compareHash = getItem('pin-code');
    const hashed = pinHasher(value);

    if (hashed === compareHash) {
      onSuccess(value);
      return;
    }

    this.setState({ value: '', trys: trys + 1 });
  };

  render() {
    const { intl } = this.props;
    const { value, trys } = this.state;

    return (
      <div className="pin-confirm-dialog-content">
        <div className="dialog-form">
          <div className="brand">
            <img src={logo} alt="" />
          </div>
          <div className="form-content">
            <h2 className="form-title">
              <FormattedMessage id="confirm-pin-code.title" />
            </h2>
            <Input.Group>
              <Col span={18}>
                <Input
                  autoFocus
                  type="password"
                  id="pin-input"
                  maxLength={20}
                  placeholder={intl.formatMessage({
                    id: 'confirm-pin-code.input-placeholder'
                  })}
                  value={value}
                  onChange={this.handleChange}
                  onKeyUp={e => {
                    if (e.key === 'Enter') {
                      this.submitForm();
                    }
                  }}
                />
              </Col>
              <Col span={3}>
                <Button
                  type="primary"
                  shape="circle"
                  disabled={value.length < 1}
                  onClick={this.submitForm}
                >
                  <i className="mi">lock_open</i>
                </Button>
              </Col>
            </Input.Group>

            {trys === defaults.maxPinCodeTry && (
              <div className="last-change">
                <Alert
                  message={intl.formatMessage({
                    id: 'confirm-pin-code.last-chance'
                  })}
                  type="warning"
                  showIcon
                />
              </div>
            )}

            {trys > 1 && (
              <Popconfirm
                title={intl.formatMessage({
                  id: 'confirm-pin-code.invalidate-confirm'
                })}
                onConfirm={this.invalidate}
                okText={intl.formatMessage({ id: 'g.yes' })}
                cancelText={intl.formatMessage({ id: 'g.no' })}
              >
                <a className="invalidate">
                  <FormattedMessage id="confirm-pin-code.invalidate" />
                </a>
              </Popconfirm>
            )}
          </div>
        </div>
      </div>
    );
  }
}

PinConfirm.defaultProps = {
  onInvalidate: () => {}
};

PinConfirm.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onInvalidate: PropTypes.func,
  actions: PropTypes.shape({
    wipePin: PropTypes.func.isRequired,
    logOut: PropTypes.func.isRequired,
    deleteAccounts: PropTypes.func.isRequired
  }).isRequired,
  history: PropTypes.instanceOf(Object).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default injectIntl(PinConfirm);
