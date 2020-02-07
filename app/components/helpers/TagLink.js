import React, { Component } from 'react';

import PropTypes from 'prop-types';

import defaults from '../../constants/defaults';

import comTag from '../../helpers/com-tag';

export const makePath = (filter, tag) => {
  if (filter === 'feed') {
    return `/${defaults.filter}/${tag}`;
  }

  return `/${filter}/${tag}`;
};

class TagLink extends Component {
  constructor(props) {
    super(props);

    this.state = {
      label: ''
    };
  }

  componentDidMount() {
    const { tag } = this.props;

    if (tag.startsWith('hive-')) {
      comTag(tag)
        .then(r => {
          this.setState({ label: r });
          return r;
        })
        .catch(() => {});
    }
  }

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
    const { label } = this.state;

    const props = {
      onClick: this.clicked
    };

    if (label) {
      props.children = label;
    }

    const clonedChildren = React.cloneElement(children, props);

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
