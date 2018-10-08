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

class ScrollReplace extends React.Component {
  constructor(props) {
    super(props);

    this.saveTimer = null;
  }

  componentDidMount() {
    const { selector } = this.props;

    this.el = document.querySelector(selector);
    if (this.el) {
      this.el.addEventListener('scroll', this.handleScroll);
    }

    // Initial replace
    const { history, location } = this.props;
    let pos = 0;
    if (history.action === 'POP') {
      pos = getPathPos(location.pathname) || 0;
    }
    this.el.scrollTop = pos;
  }

  componentWillReceiveProps(nextProps) {
    const { location: actual } = this.props;
    const { location: next } = nextProps;

    // Replace when location change
    if (next !== actual) {
      // when page changed
      const { history } = this.props;
      let pos = 0;
      if (history.action === 'POP') {
        // if back or forward button clicked get last scroll position for location
        pos = getPathPos(next.pathname) || 0;
      }

      this.el.scrollTop = pos;
    }
  }

  componentWillUnmount() {
    this.el.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll = () => {
    const { location } = this.props;
    const pos = this.el.scrollTop;

    const save = () => {
      setPathPos(location.pathname, pos);
      // console.log(`${location.pathname} saved ${pos}`)
    };

    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(save, 300);
  };

  render() {
    return null;
  }
}

ScrollReplace.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }).isRequired,
  history: PropTypes.shape({
    action: PropTypes.string.isRequired
  }).isRequired,
  selector: PropTypes.string.isRequired
};

export default ScrollReplace;
