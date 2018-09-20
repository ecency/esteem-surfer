import React, { Component } from 'react';

import PropTypes from 'prop-types';

class Mi extends Component {
  static defaultProps = {
    rotatedRight: false
  };

  render() {
    const { icon, rotatedRight } = this.props;

    const className = `mi ${rotatedRight ? 'rotated-right' : ''}`;

    return <i className={className}>{icon}</i>;
  }
}

Mi.defaultProps = {
  rotatedRight: false
};

Mi.propTypes = {
  icon: PropTypes.string.isRequired,
  rotatedRight: PropTypes.bool
};

export default Mi;
