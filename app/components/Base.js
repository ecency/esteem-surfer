import React from 'react';

import PropTypes from 'prop-types';

const setPathPos = (path, pos) => {
  if (window.scrollDb === undefined) {
    window.scrollDb = {};
  }

  window.scrollDb[path] = pos;
};

const getPathPos = path => {
  if (window.scrollDb) {
    return window.scrollDb[path];
  }

  return undefined;
};

class Base extends React.Component {
  constructor(props) {
    super(props);

    this.saveTimer = null;
  }

  componentDidMount() {
    this.el = document.querySelector('#app-content');
    this.el.addEventListener('scroll', this.handleScroll);
  }

  componentWillReceiveProps(nextProps) {

    const {location: actual} = this.props;
    const {location: next} = nextProps;

    if (next !== actual) {
      // when page changed
      const {history} = this.props;
      let pos = 0;
      if (history.action === 'POP') {
        // if back or forward button clicked get scroll position
        pos = getPathPos(next.pathname) || 0;
      }

      this.el.scrollTop = pos;
    }
  }

  componentWillUnmount() {
    this.el.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll = () => {
    const {location} = this.props;
    const pos = this.el.scrollTop;


    const save = () => {
      setPathPos(location.pathname, pos);
      console.log(`${location.pathname} saved ${pos}`)
    };

    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(save, 300);
  };


}

Base.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }).isRequired,
  history: PropTypes.shape({
    action: PropTypes.string.isRequired
  }).isRequired
};

export default Base;
