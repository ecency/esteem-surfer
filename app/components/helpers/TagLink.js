import React, { Component } from 'react';

import PropTypes from 'prop-types';

import defaults from '../../constants/defaults';

export const makePath = (filter, tag) => {
  if (filter === 'feed') {
    return `/${defaults.filter}/${tag}`;
  }

  return `/${filter}/${tag}`;
};

class TagLink extends Component {
  clicked = () => {
    const { tag, global, location, history } = this.props;
    const { selectedFilter } = global;

    const newLoc = makePath(selectedFilter, tag);

    if (location.pathname === newLoc) {
      document.querySelector('#app-content').scrollTop = 0;
      return;
    }

    history.push(newLoc);
  };

  render() {
    const { children } = this.props;

    const clonedChildren = React.cloneElement(children, {
      onClick: this.clicked
    });

    return clonedChildren;
  }
}

TagLink.propTypes = {
  global: PropTypes.shape({
    selectedFilter: PropTypes.string.isRequired
  }).isRequired,
  history: PropTypes.shape({}).isRequired,
  location: PropTypes.shape({}).isRequired,
  tag: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired
};

export default TagLink;
