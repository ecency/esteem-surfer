import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'react-fast-compare';

class ListSwitch extends Component {
  shouldComponentUpdate(nextProps) {
    const { global } = this.props;
    return !isEqual(global.listStyle, nextProps.global.listStyle);
  }

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
