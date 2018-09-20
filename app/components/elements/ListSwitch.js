import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ListSwitch extends Component {
  changeStyle = () => {
    const { actions } = this.props;

    actions.changeListStyle();
  };

  render() {
    const { global } = this.props;
    const { listStyle } = global;

    return (
      <a
        className={`list-switch ${listStyle === 'grid' ? 'active' : ''}`}
        onClick={() => {
          this.changeStyle();
        }}
        role="none"
      >
        <i className="mi">view_module</i>
      </a>
    );
  }
}

ListSwitch.propTypes = {
  actions: PropTypes.shape({
    changeListStyle: PropTypes.func.isRequired
  }).isRequired,
  global: PropTypes.shape({
    listStyle: PropTypes.string.isRequired
  }).isRequired
};

export default ListSwitch;
