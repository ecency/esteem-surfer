import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Col, Input, Modal } from 'antd';
import { FormattedMessage, injectIntl } from 'react-intl';

import pinHasher from '../../utils/pin-hasher';
import { getItem, setItem } from '../../helpers/storage';
import logo from '../../img/logo-big.png';
import defaults from '../../constants/defaults';

class PinCreate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dialogVisible: false,
      value: ''
    };

    this.intId = null;
  }

  componentDidMount() {
    this.intId = setInterval(() => {
      const { dialogVisible } = this.state;

      if (dialogVisible) {
        return;
      }

      const code = getItem('pin-code');

      if (!code) {
        this.setState({ dialogVisible: true });

        const { actions } = this.props;
        actions.wipePin();
      }
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.intId);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  submitForm() {
    const { actions } = this.props;
    const { value } = this.state;

    const hashed = pinHasher(value);

    setItem('pin-code', hashed);
    actions.exposePin(value);
    this.setState({ dialogVisible: false, value: '' });
  }

  render() {
    const { intl } = this.props;
    const { dialogVisible, value } = this.state;

    return (
      <Modal
        footer={null}
        closable={false}
        keyboard={false}
        width="500px"
        centered
        destroyOnClose
        afterClose={() => {
          console.log('closed');
        }}
        visible={dialogVisible}
      >
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
                    maxLength={20}
                    placeholder={intl.formatMessage({
                      id: 'create-pin-code.input-placeholder'
                    })}
                    value={value}
                    onChange={e => {
                      this.handleChange(e);
                    }}
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
                    onClick={() => {
                      this.submitForm();
                    }}
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
      </Modal>
    );
  }
}

PinCreate.propTypes = {
  actions: PropTypes.shape({
    exposePin: PropTypes.func.isRequired,
    wipePin: PropTypes.func.isRequired
  }).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default injectIntl(PinCreate);
