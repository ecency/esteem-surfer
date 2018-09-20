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

    this.detectScroll = this.detectScroll.bind(this);
    this.saveTimer = null;
  }

  componentDidMount() {
    const { selector } = this.props;
    const el = document.querySelector(selector);
    if (el) {
      this.el = el;
      this.el.addEventListener('scroll', this.detectScroll);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.el) {
      return;
    }

    const { location: actual } = this.props;
    const { location: next } = nextProps;

    if (next !== actual) {
      const { history } = this.props;
      let pos = 0;
      if (history.action === 'POP') {
        pos = getPathPos(next.pathname) || 0;
      }

      this.el.scrollTop = pos;
    }
  }

  componentWillUnmount() {
    if (this.el) {
      this.el.removeEventListener('scroll', this.detectScroll);
    }
  }

  detectScroll() {
    const { location } = this.props;
    const pos = this.el.scrollTop;

    const save = () => {
      setPathPos(location.pathname, pos);
      // console.log(`${pathname} saved ${pos}`)
    };

    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(save, 300);
  }

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
