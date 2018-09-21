import React, { Component, Fragment } from 'react';

import PropTypes from 'prop-types';

class FormattedCurrency extends Component {
  render() {
    const { global, value, fixAt } = this.props;
    const { currencyRate, currencySymbol } = global;

    const valInCurrency = value * currencyRate;

    return (
      <Fragment key="result-val">{`${currencySymbol} ${valInCurrency.toFixed(
        fixAt
      )}`}</Fragment>
    );
  }
}

FormattedCurrency.defaultProps = {
  fixAt: 2
};

FormattedCurrency.propTypes = {
  global: PropTypes.shape({
    currencyRate: PropTypes.number.isRequired,
    currencySymbol: PropTypes.string.isRequired
  }).isRequired,
  value: PropTypes.number.isRequired,
  fixAt: PropTypes.number
};

export default FormattedCurrency;
