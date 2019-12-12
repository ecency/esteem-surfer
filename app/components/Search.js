/* eslint-disable react/no-multi-comp */

import React, { PureComponent } from 'react';

import PropTypes from 'prop-types';

import { Select, message } from 'antd';

import {
  FormattedRelative,
  FormattedNumber,
  FormattedMessage
} from 'react-intl';

import {
  catchPostImage,
  postBodySummary
} from '@esteemapp/esteem-render-helpers';

import NavBar from './layout/NavBar';
import AppFooter from './layout/AppFooter';

import DeepLinkHandler from './helpers/DeepLinkHandler';

import UserAvatar from './elements/UserAvatar';
import QuickProfile from './helpers/QuickProfile';
import TagLink from './helpers/TagLink';
import EntryLink from './helpers/EntryLink';
import LinearProgress from './common/LinearProgress';

import ScrollReplace from './helpers/ScrollReplace';

import qsParse from '../utils/qs';

import { makeGroupKeyForResults } from '../actions/search-results';

import fallbackImage from '../img/fallback.png';
import noImage from '../img/noimage.png';

import { searchSort } from '../constants/defaults';

class SearchListItem extends PureComponent {
  render() {
    const { result: entry } = this.props;
    const img = catchPostImage(entry.body, 130, 80) || noImage;
    const summary = postBodySummary(entry.body, 200);

    const { global } = this.props;
    const { currencyRate, currencySymbol } = global;

    const valInCurrency = entry.payout * currencyRate || 0;
    return (
      <div className="search-list-item">
        <div className="item-header">
          <QuickProfile
            {...this.props}
            username={entry.author}
            reputation={entry.author_rep}
          >
            <div className="author-part">
              <div className="author-avatar">
                <UserAvatar {...this.props} user={entry.author} size="small" />
              </div>
              <div className="author">
                {entry.author}{' '}
                <span className="author-reputation">
                  {entry.author_rep.toFixed(0)}
                </span>
              </div>
            </div>
          </QuickProfile>

          <TagLink {...this.props} tag={entry.category}>
            <a className="category" role="none">
              {entry.category}
            </a>
          </TagLink>

          <span className="date">
            <FormattedRelative
              value={entry.created_at}
              initialNow={Date.now()}
            />
          </span>
        </div>
        <div className="item-body">
          <div className="item-image">
            <EntryLink
              {...this.props}
              author={entry.author}
              permlink={entry.permlink}
            >
              <img
                src={img}
                alt=""
                onError={e => {
                  e.target.src = fallbackImage;
                }}
              />
            </EntryLink>
          </div>
          <div className="item-summary">
            <EntryLink
              {...this.props}
              author={entry.author}
              permlink={entry.permlink}
            >
              <div className="item-title">{entry.title}</div>
            </EntryLink>
            <EntryLink
              {...this.props}
              author={entry.author}
              permlink={entry.permlink}
            >
              <div className="item-body">{summary}</div>
            </EntryLink>
          </div>

          <div className="item-controls">
            <a className="total-payout">
              {currencySymbol}{' '}
              <FormattedNumber
                value={valInCurrency}
                maximumFractionDigits={2}
              />
            </a>
            <a className="voters">
              <i className="mi">people</i>
              {entry.total_votes}
            </a>
            <a className="comments">
              <i className="mi">comment</i>
              {entry.children}
            </a>
          </div>
        </div>
      </div>
    );
  }
}

SearchListItem.propTypes = {
  result: PropTypes.shape({
    title: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    author_rep: PropTypes.number.isRequired,
    children: PropTypes.number.isRequired,
    body: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    total_votes: PropTypes.number.isRequired
  }).isRequired,
  global: PropTypes.shape({
    currencyRate: PropTypes.number.isRequired,
    currencySymbol: PropTypes.string.isRequired
  }).isRequired
};

class Search extends PureComponent {
  constructor(props) {
    super(props);

    const { location } = this.props;
    const { search } = location;
    const qs = qsParse(search);
    const { q, sort = searchSort } = qs;

    this.state = { q, sort };
  }

  componentDidMount() {
    this.fetch();

    const el = document.querySelector('#app-content');
    if (el) {
      this.scrollEl = el;
      this.scrollEl.addEventListener('scroll', () => {
        this.detectScroll();
      });
    }
  }

  componentDidUpdate() {
    const data = this.getData();
    const err = data.get('err');
    if (err) {
      message.error('A server error occurred');
      const { actions } = this.props;
      const { q, sort } = this.state;
      actions.resetSearchError(q, sort);
    }
  }

  getData = () => {
    const { q, sort } = this.state;
    const groupKey = makeGroupKeyForResults(q, sort);

    const { searchResults } = this.props;
    return searchResults.get(groupKey);
  };

  fetch = (more = false) => {
    const data = this.getData();
    const loading = data.get('loading');

    if (loading) {
      return;
    }

    const { q, sort } = this.state;
    const { actions } = this.props;

    actions.fetchSearchResults(q, sort, more);
  };

  detectScroll() {
    const data = this.getData();
    const loading = data.get('loading');
    const hasMore = data.get('hasMore');

    if (!hasMore || loading) {
      return;
    }

    if (
      this.scrollEl.scrollTop + this.scrollEl.offsetHeight + 100 >=
      this.scrollEl.scrollHeight
    ) {
      this.bottomReached();
    }
  }

  bottomReached() {
    this.fetch(true);
  }

  refresh = () => {
    const { actions } = this.props;
    const { q, sort } = this.state;

    actions.invalidateSearchResults(q, sort);
    actions.fetchSearchResults(q, sort);
  };

  sortChanged = sort => {
    const { history } = this.props;
    const { q } = this.state;

    history.push(`/search?q=${encodeURIComponent(q)}&sort=${sort}`);
  };

  render() {
    const { q, sort } = this.state;

    const data = this.getData();
    const results = data.get('results');
    const loading = data.get('loading');
    const hits = data.get('hits');

    return (
      <div className="wrapper">
        <NavBar
          postBtnActive
          {...Object.assign({}, this.props, {
            reloadFn: () => {
              this.refresh();
            },
            reloading: loading
          })}
        />
        <div className="app-content search-page" id="app-content">
          {!loading && (
            <div className="search-info">
              <div className="result-count">
                <FormattedMessage
                  id="search.n-results-for-q"
                  values={{ n: <FormattedNumber value={hits} />, q }}
                />
              </div>
              <div className="search-options">
                <FormattedMessage id="search.sort-by" />{' '}
                <Select
                  value={sort}
                  disabled={loading}
                  style={{ width: 160 }}
                  onChange={this.sortChanged}
                >
                  <Select.Option value="popularity">
                    <FormattedMessage id="search.sort-popularity" />
                  </Select.Option>
                  <Select.Option value="relevance">
                    <FormattedMessage id="search.sort-relevance" />
                  </Select.Option>
                  <Select.Option value="newest">
                    <FormattedMessage id="search.sort-newest" />
                  </Select.Option>
                </Select>
              </div>
            </div>
          )}

          {results.valueSeq().map(d => (
            <SearchListItem
              {...this.props}
              key={`${d.author}-${d.permlink}`}
              result={d}
            />
          ))}

          {loading && <LinearProgress />}
        </div>
        <AppFooter {...this.props} />
        <ScrollReplace {...this.props} selector="#app-content" />
        <DeepLinkHandler {...this.props} />
      </div>
    );
  }
}

Search.defaultProps = {};

Search.propTypes = {
  actions: PropTypes.shape({
    fetchSearchResults: PropTypes.func.isRequired,
    invalidateSearchResults: PropTypes.func.isRequired,
    resetSearchError: PropTypes.func.isRequired
  }).isRequired,
  match: PropTypes.instanceOf(Object).isRequired,
  history: PropTypes.instanceOf(Object).isRequired,
  location: PropTypes.instanceOf(Object).isRequired,
  searchResults: PropTypes.instanceOf(Object).isRequired
};

export default Search;
