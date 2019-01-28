import React, { Component, Fragment } from 'react';
import { Modal } from 'antd';

import PropTypes from 'prop-types';
import PinConfirm from '../dialogs/PinConfirm';

class PinRequired extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false
    };
  }

  onPinInvalidated = () => {
    this.setState({ show: false });
  };

  onConfirmPinSuccess = value => {
    const { onSuccess } = this.props;
    this.setState({ show: false }, () => {
      onSuccess(value);
    });
  };

  cancelFn = () => {
    this.setState({ show: false });
  };

  render() {
    const { children } = this.props;
    const { show } = this.state;

    // Clone child element rewriting onclick event
    const newChild = React.cloneElement(children, {
      onClick: () => {
        this.setState({ show: true });
      }
    });

    return (
      <Fragment>
        {show && (
          <Modal
            footer={null}
            closable
            onCancel={this.cancelFn}
            keyboard
            visible
            width="500px"
            centered
            destroyOnClose
          >
            <PinConfirm
              {...this.props}
              onSuccess={this.onConfirmPinSuccess}
              onInvalidate={this.onPinInvalidated}
            />
          </Modal>
        )}
        {newChild}
      </Fragment>
    );
  }
}

PinRequired.defaultProps = {
  onSuccess: () => {}
};

PinRequired.propTypes = {
  children: PropTypes.element.isRequired,
  history: PropTypes.instanceOf(Object).isRequired,
  onSuccess: PropTypes.func
};

export default PinRequired;
