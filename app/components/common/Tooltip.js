/*
  A wrapper for antd's tooltip. Hides itself when clicked.
*/

import React, { Component } from 'react';
import { Tooltip as RealTooltip } from 'antd';
import PropTypes from 'prop-types';

class Tooltip extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: true
    };
  }

  render() {
    const { children, title, onClick, mouseEnterDelay, placement } = this.props;
    const { visible } = this.state;

    const ownProps = { title, mouseEnterDelay, placement };

    if (!visible) {
      ownProps.visible = false;
    }

    return (
      <RealTooltip
        className="tooltip-handler"
        {...ownProps}
        onClick={() => {
          onClick();
          this.setState({ visible: false });
        }}
        onMouseLeave={() => {
          this.setState({ visible: true });
        }}
      >
        {children}
      </RealTooltip>
    );
  }
}

Tooltip.defaultProps = {
  onClick: () => {},
  mouseEnterDelay: 1,
  placement: 'top'
};

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  placement: PropTypes.string,
  onClick: PropTypes.func,
  mouseEnterDelay: PropTypes.number
};

export default Tooltip;
