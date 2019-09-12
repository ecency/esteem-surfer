import React, { Component } from 'react';

import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';

import wordCounter from '../../utils/word-counter';

class WordCount extends Component {
  constructor(props) {
    super(props);

    this.state = {
      wordsCount: 0
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
    this.setState({ wordsCount: words });
  };

  render() {
    const { wordsCount } = this.state;

    if (wordsCount > 0) {
      return (
        <div className="words-count">
          <FormattedMessage id="word-count.label" values={{ n: wordsCount }} />
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
