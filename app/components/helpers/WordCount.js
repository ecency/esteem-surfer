import React, { Component } from 'react';

import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';

import isEqual from 'react-fast-compare';

import wordCounter from '../../utils/word-counter';

class WordCount extends Component {
  constructor(props) {
    super(props);

    this.state = {
      count: 0,
      time: 0
    };
  }

  componentDidMount() {
    const { watch } = this.props;

    if (watch) {
      this.countTimer = setInterval(this.countWords, 1000);
    } else {
      setTimeout(() => {
        this.countWords();
      }, 1000);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.state, nextState);
  }

  componentWillUnmount() {
    clearInterval(this.countTimer);
  }

  countWords = () => {
    const { selector } = this.props;
    const el = document.querySelector(selector);
    if (!el) {
      return;
    }
    const val = el.innerText.trim();
    const { words } = wordCounter(val);
    const wordsPerSec = 140;
    const time = words / wordsPerSec;

    this.setState({ count: words, time });
  };

  render() {
    const { count, time } = this.state;

    let timeEl = null;

    if (time <= 0.8) {
      timeEl = <FormattedMessage id="word-count.read-time-less-1-min" />;
    } else {
      timeEl = (
        <FormattedMessage
          id="word-count.read-time-n-min"
          values={{ n: Math.ceil(time) }}
        />
      );
    }

    if (count > 0) {
      return (
        <div className="words-count">
          <span className="words">
            <FormattedMessage id="word-count.label" values={{ n: count }} />
          </span>
          <span className="time"> {timeEl} </span>
        </div>
      );
    }
    return null;
  }
}

WordCount.defaultProps = {
  watch: false
};

WordCount.propTypes = {
  selector: PropTypes.string.isRequired,
  watch: PropTypes.bool
};

export default WordCount;
