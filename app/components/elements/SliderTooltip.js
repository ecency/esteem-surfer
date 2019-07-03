import React, { Component } from 'react';

import PropTypes from 'prop-types';

export default class SliderTooltip extends Component {
  constructor(props) {
    super(props);

    this.eId = Math.floor(Math.random() * 10000);
  }

  componentDidMount() {
    this.forceUpdate();
  }

  render() {
    const { percentage, value } = this.props;

    const holderEl = document.querySelector(
      `#sth-${this.eId}.slider-tooltip-holder`
    );
    const tooltipEl = document.querySelector(
      `#sth-${this.eId} .slider-tooltip`
    );

    const holderWidth = holderEl ? holderEl.clientWidth : 0;
    const tooltipWidth = tooltipEl ? tooltipEl.clientWidth : 0;

    // 2 px margin
    const availableSpace = holderWidth - tooltipWidth - 2;

    let left = 0;

    if (availableSpace) {
      left = parseInt((availableSpace / 100) * percentage, 10);

      // Limits
      if (left < 0) {
        left = 0;
      }

      if (left > availableSpace) {
        left = availableSpace;
      }
    }

    const displayValue = value !== null ? value : `${percentage}%`;

    return (
      <div
        id={`sth-${this.eId}`}
        className="slider-tooltip-holder"
        style={{ left: `${left}px` }}
      >
        <div className="slider-tooltip">{displayValue}</div>
      </div>
    );
  }
}

SliderTooltip.defaultProps = {
  value: null
};

SliderTooltip.propTypes = {
  percentage: PropTypes.number.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
};
