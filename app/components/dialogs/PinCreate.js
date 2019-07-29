import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Col, Input, message } from 'antd';
import { FormattedMessage, injectIntl } from 'react-intl';

import { pinHasher } from '../../utils/crypto';
import logo from '../../img/logo-big.png';
import defaults from '../../constants/defaults';

class PinCreate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: ''
    };
  }

  componentDidMount() {
    document.addEventListener('click', this.docClicked);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.docClicked);
  }

  docClicked = e => {
    if (!e.target.classList.contains('pin-input')) {
      document.querySelector('.pin-input').focus();
    }
  };

  handleChange = e => {
    this.setState({ value: e.target.value });
  };

  submitForm = () => {
    const { onSuccess, intl } = this.props;
    const { value } = this.state;

    const hashed = pinHasher(value);

    this.setState({ value: '' });
    onSuccess(value, hashed);

    message.success(intl.formatMessage({ id: 'create-pin-code.created' }));
  };

  render() {
    const { intl } = this.props;
    const { value } = this.state;

    return (
      <div className="pin-create-dialog-content">
        <div className="dialog-form">
          <div className="brand">
            <img src={logo} alt="" />
          </div>
          <div className="form-content">
            <h2 className="form-title">
              <FormattedMessage id="create-pin-code.title" />
            </h2>
            <p className="form-desc">
              <FormattedMessage id="create-pin-code.desc1" />
            </p>
            <Input.Group>
              <Col span={18}>
                <Input
                  autoFocus
                  type="password"
                  className="pin-input"
                  maxLength={20}
                  placeholder={intl.formatMessage({
                    id: 'create-pin-code.input-placeholder'
                  })}
                  value={value}
                  onChange={this.handleChange}
                  onKeyUp={e => {
                    if (
                      e.key === 'Enter' &&
                      value.length >= defaults.minPinCode
                    ) {
                      this.submitForm();
                    }
                  }}
                />
              </Col>
              <Col span={3}>
                <Button
                  type="primary"
                  shape="circle"
                  disabled={value.length < defaults.minPinCode}
                  onClick={this.submitForm}
                >
                  <i className="mi">lock</i>
                </Button>
              </Col>
            </Input.Group>
            <p className="form-desc2">
              <FormattedMessage id="create-pin-code.desc2" />
            </p>
          </div>
        </div>
      </div>
    );
  }
}

PinCreate.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default injectIntl(PinCreate);
