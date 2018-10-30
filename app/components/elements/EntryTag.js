import React, {Component} from 'react';

import PropTypes from 'prop-types';

import defaults from '../../constants/defaults';


class EntryTag extends Component {
  clicked = () => {
    const {tag, global, location, history} = this.props;
    let {selectedFilter} = global;
    if (selectedFilter === 'feed') {
      selectedFilter = defaults.filter
    }
    const newLoc = `/${selectedFilter}/${tag}`;

    if (location.pathname === newLoc) {
      document.querySelector('#app-content').scrollTop = 0;
      return;
    }

    history.push(newLoc);
  };

  render() {
    const {children} = this.props;

    const clonedChildren = React.cloneElement(children, {
      onClick: this.clicked
    });

    return (
      clonedChildren
    );
  }
}

EntryTag.propTypes = {
  global: PropTypes.shape({
    selectedFilter: PropTypes.string.isRequired
  }).isRequired,
  history: PropTypes.shape({}).isRequired,
  location: PropTypes.shape({}).isRequired,
  tag: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired
};

export default EntryTag;
