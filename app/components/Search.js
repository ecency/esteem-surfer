/* eslint-disable react/no-multi-comp */

import React, { PureComponent } from 'react';

import PropTypes from 'prop-types';

import { Select, message } from 'antd';

import {
  FormattedRelative,
  FormattedNumber,
  FormattedMessage
} from 'react-intl';

import NavBar from './layout/NavBar';
import AppFooter from './layout/AppFooter';

import DeepLinkHandler from './helpers/DeepLinkHandler';

import UserAvatar from './elements/UserAvatar';
import QuickProfile from './helpers/QuickProfile';
import TagLink from './helpers/TagLink';
import EntryLink from './helpers/EntryLink';
import LinearProgress from './common/LinearProgress';

import entryBodySummary from '../utils/entry-body-summary';
import catchEntryImage from '../utils/catch-entry-image';


class SearchListItem extends PureComponent {
  render() {
    const { result: entry } = this.props;
    const img = catchEntryImage(entry, 130, 80) || 'img/noimage.png';
    const summary = entryBodySummary(entry.body, 200);

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
                <UserAvatar user={entry.author} size="small"/>
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
                  e.target.src = 'img/fallback.png';
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
              {'$ '} <FormattedNumber value={entry.payout.toFixed(2)}/>
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
  }).isRequired
};

class Search extends PureComponent {

  componentDidMount() {

    const el = document.querySelector('#app-content');
    if (el) {
      this.scrollEl = el;
      this.scrollEl.addEventListener('scroll', () => {
        this.detectScroll();
      });
    }
  }

  fetch = (newSort = null, more = false) => {
    const { actions, searchResults } = this.props;
    const { q, sort } = searchResults;

    actions.fetchSearchResults(q, (newSort || sort), more);
  };

  detectScroll() {
    const { searchResults } = this.props;
    const { hasMore, loading } = searchResults;
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
    this.fetch(null, true);
  }

  refresh = () => {
    const { actions } = this.props;
    actions.invalidateSearchResults();

    this.fetch();
  };

  sortChanged = sort => {
    const { actions } = this.props;
    actions.invalidateSearchResults();
    this.fetch(sort);
  };

  render() {

    const { searchResults } = this.props;
    const { results, sort, loading, hits, q } = searchResults;


    return (
      <div className="wrapper">
        <NavBar
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
                  values={{ n: <FormattedNumber value={hits}/>, q }}
                />
              </div>
              <div className="search-options">
                <FormattedMessage id="search.sort-by"/>{' '}
                <Select
                  value={sort}
                  disabled={loading}
                  style={{ width: 120 }}
                  onChange={this.sortChanged}
                >
                  <Select.Option value="popularity">
                    <FormattedMessage id="search.sort-popularity"/>
                  </Select.Option>
                  <Select.Option value="relevance">
                    <FormattedMessage id="search.sort-relevance"/>
                  </Select.Option>
                  <Select.Option value="newest">
                    <FormattedMessage id="search.sort-newest"/>
                  </Select.Option>
                </Select>
              </div>
            </div>
          )}

          {results.map(d => (
            <SearchListItem {...this.props} key={d.id} result={d}/>
          ))}

          {loading && <LinearProgress/>}
        </div>
        <AppFooter {...this.props} />
        <DeepLinkHandler {...this.props} />
      </div>
    );
  }
}

Search.defaultProps = {};

Search.propTypes = {
  actions: PropTypes.shape({
    fetchSearchResults: PropTypes.func.isRequired,
    invalidateSearchResults: PropTypes.func.isRequired
  }).isRequired,
  match: PropTypes.instanceOf(Object).isRequired,
  history: PropTypes.instanceOf(Object).isRequired,
  location: PropTypes.instanceOf(Object).isRequired,
  searchResults: PropTypes.instanceOf(Object).isRequired
};

export default Search;
