/* eslint-disable jsx-a11y/no-autofocus */

import React, { PureComponent, Fragment } from 'react';

import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

const Mark = require('mark.js');

let markInstance = null;

class SearchInPage extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      keyword: '',
      matches: 0,
      cursor: 0,
      active: false,
      focus: true
    };

    this.timer = null;
  }

  componentDidMount() {
    window.addEventListener('keydown', this.onWindowKeyDown);
    markInstance = new Mark('#app-content');

    const { history } = this.props;
    history.listen(() => {
      this.close();
    });
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onWindowKeyDown);
    markInstance = null;
  }

  close = () => {
    this.setState(
      { visible: false, keyword: '', matches: 0, cursor: 0, active: false },
      () => {
        markInstance.unmark({});
      }
    );
  };

  toggle = () => {
    const { visible, focus } = this.state;

    if (visible) {
      if (!focus) {
        document.querySelector('#page-search-query').focus();
        return;
      }

      this.close();
    } else {
      this.setState({ visible: true });
    }
  };

  onWindowKeyDown = e => {
    // ctrl + f
    if (e.keyCode === 70 && e.metaKey) {
      this.toggle();
    }
  };

  focusElem = index => {
    const elems = document.querySelectorAll('mark[data-markjs="true"]');

    if (elems.length === 0) {
      return;
    }

    elems.forEach(e => e.classList.remove('active-elem'));

    const elem = elems[index - 1];

    elem.classList.add('active-elem');

    elem.scrollIntoView({ block: 'center' });
  };

  moveNext = () => {
    const { matches, active } = this.state;

    if (!active) {
      return;
    }

    let { cursor } = this.state;

    if (cursor === matches) {
      cursor = 0;
    }

    const newCursor = cursor + 1;
    this.setState({ cursor: newCursor }, () => {
      this.focusElem(newCursor);
    });
  };

  movePrev = () => {
    const { cursor, active } = this.state;
    if (!active) {
      return;
    }

    if (cursor === 1) {
      return;
    }

    const newCursor = cursor - 1;

    this.setState({ cursor: newCursor }, () => {
      this.focusElem(newCursor);
    });
  };

  onKeyDown = e => {
    if (e.keyCode !== 13) {
      return;
    }

    this.moveNext();
  };

  search = () => {
    markInstance.unmark({});

    const { keyword } = this.state;

    if (keyword.trim() === '') {
      this.setState({ matches: 0, cursor: 0, active: false });
      return;
    }

    const opts = {
      diacritics: false,
      separateWordSearch: false,
      exclude: ['.mi', '.CodeMirror *', '.ant-select *', 'input', 'button *'],
      done: c => {
        this.setState({ matches: c, active: true });

        if (c > 0) {
          this.setState({ cursor: 1 }, () => {
            this.focusElem(1);
          });
        }
      }
    };

    markInstance.mark(keyword, opts);
  };

  keywordChanged = e => {
    const keyword = e.target.value;

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.setState({ keyword }, () => {
      this.timer = setTimeout(this.search, 200);
    });
  };

  render() {
    const { visible, keyword, cursor, matches, active } = this.state;

    if (visible) {
      return (
        <div className="search-in-page">
          <div className="search-control">
            <div className="search-part">
              <input
                id="page-search-query"
                type="text"
                value={keyword}
                autoFocus
                placeholder="Search"
                onChange={this.keywordChanged}
                onKeyDown={this.onKeyDown}
                onFocus={() => {
                  this.setState({ focus: true });
                }}
                onBlur={() => {
                  this.setState({ focus: false });
                }}
              />
              <div className="control-separator" />
              {active && (
                <div className="matches">
                  {matches > 0 && (
                    <Fragment>
                      {cursor} / {matches}
                    </Fragment>
                  )}
                  {!matches && (
                    <Fragment>
                      <FormattedMessage id="navbar.search-no-matches" />
                    </Fragment>
                  )}
                </div>
              )}
            </div>
            <div className="control-part">
              <div role="none" className="control-prev" onClick={this.movePrev}>
                <i className="mi">keyboard_arrow_up</i>
              </div>
              <div role="none" className="control-next" onClick={this.moveNext}>
                <i className="mi">keyboard_arrow_down</i>
              </div>
              <div role="none" className="control-prev" onClick={this.toggle}>
                <i className="mi">close</i>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return '';
  }
}

SearchInPage.propTypes = {
  history: PropTypes.instanceOf(Object).isRequired
};

export default SearchInPage;
