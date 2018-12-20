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

  };

  onConfirmPinSuccess = () => {
    const { children } = this.props;
    const { onClick } = children.props;
    this.setState({ show: false }, () => {
      onClick();
    });
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
        {show &&
        <Modal
          footer={null}
          closable={false}
          keyboard={false}
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
        }
        {newChild}
      </Fragment>
    );
  }
}

PinRequired.defaultProps = {};

PinRequired.propTypes = {
  children: PropTypes.element.isRequired
};

export default PinRequired;
