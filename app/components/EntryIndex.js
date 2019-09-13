import React, { Fragment, PureComponent } from 'react';

import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { Menu, message } from 'antd';
import { FormattedMessage } from 'react-intl';

import { makeGroupKeyForEntries } from '../actions/entries';

import filters from '../constants/filters.json';

import NavBar from './layout/NavBar';
import AppFooter from './layout/AppFooter';

import ScrollReplace from './helpers/ScrollReplace';

import EntryListItem from './elements/EntryListItem';
import EntryListLoadingItem from './elements/EntryListLoadingItem';
import ComposeBtn from './elements/ComposeBtn';
import TagLink from './helpers/TagLink';

import DropDown from './common/DropDown';
import ListSwitch from './elements/ListSwitch';
import LinearProgress from './common/LinearProgress';
import DeepLinkHandler from './helpers/DeepLinkHandler';

import formatChainError from '../utils/format-chain-error';

class EntryIndex extends PureComponent {
  componentDidMount() {
    this.startFetch();

    const el = document.querySelector('#app-content');
    if (el) {
      this.scrollEl = el;
      this.scrollEl.addEventListener('scroll', () => {
        this.detectScroll();
      });
    }
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props;

    if (location !== prevProps.location) {
      this.startFetch();
    }

    const { entries, global } = this.props;
    const { selectedFilter, selectedTag } = global;
    const groupKey = makeGroupKeyForEntries(selectedFilter, selectedTag);
    const data = entries.get(groupKey);
    const err = data.get('err');
    if (err) {
      message.error(formatChainError(err));
    }
  }

  scrollEl = {};

  startFetch = more => {
    const { global, actions } = this.props;
    const { selectedFilter, selectedTag } = global;

    actions.fetchEntries(selectedFilter, selectedTag, more);
    actions.fetchTrendingTags();
    actions.fetchPromotedEntries();
  };

  makeFilterMenu = active => {
    const { global, activeAccount } = this.props;
    const { selectedTag, selectedFilter } = global;

    return (
      <Menu selectedKeys={[active]} className="surfer-dropdown-menu">
        {activeAccount && (
          <Menu.Item key="feed">
            <Link to={`/@${activeAccount.username}/feed`}>
              <FormattedMessage id="entry-index.filter-feed" />
            </Link>
          </Menu.Item>
        )}
        {filters.map(filter => {
          const linkTo =
            selectedTag && selectedFilter !== 'feed'
              ? `/${filter}/${selectedTag}`
              : `/${filter}`;
          return (
            <Menu.Item key={filter}>
              <Link to={linkTo}>
                <FormattedMessage id={`entry-index.filter-${filter}`} />
              </Link>
            </Menu.Item>
          );
        })}
      </Menu>
    );
  };

  detectScroll() {
    if (
      this.scrollEl.scrollTop + this.scrollEl.offsetHeight + 100 >=
      this.scrollEl.scrollHeight
    ) {
      this.bottomReached();
    }
  }

  bottomReached() {
    const { global, entries } = this.props;
    const { selectedFilter, selectedTag } = global;

    const groupKey = makeGroupKeyForEntries(selectedFilter, selectedTag);
    const data = entries.get(groupKey);
    const loading = data.get('loading');
    const hasMore = data.get('hasMore');

    if (!loading && hasMore) {
      this.startFetch(true);
    }
  }

  refresh() {
    const { global, actions } = this.props;
    const { selectedFilter, selectedTag } = global;

    actions.invalidateEntries(selectedFilter, selectedTag);
    actions.fetchEntries(selectedFilter, selectedTag, false);
    actions.fetchPromotedEntries();

    this.scrollEl.scrollTop = 0;
  }

  render() {
    const {
      entries,
      promotedEntries,
      trendingTags,
      location,
      global
    } = this.props;
    const { selectedFilter, selectedTag } = global;
    const promoted = promotedEntries.get('entries').toArray();

    const filterMenu = this.makeFilterMenu(selectedFilter);
    const groupKey = makeGroupKeyForEntries(selectedFilter, selectedTag);

    const data = entries.get(groupKey);
    const entryList = data.get('entries');
    const loading = data.get('loading');

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

        <div className="app-content entry-index">
          <div className="page-header">
            <div className="left-side">
              <ComposeBtn {...this.props} />
            </div>

            <div className="right-side">
              <div className={`page-tools ${loading ? 'loading' : ''}`}>
                <div className="filter-select">
                  <span className="label">
                    <FormattedMessage
                      id={`entry-index.filter-${selectedFilter}`}
                    />
                  </span>
                  <DropDown menu={filterMenu} location={location} />
                </div>
                <ListSwitch {...this.props} />
              </div>
              {loading && entryList.size === 0 ? <LinearProgress /> : ''}
            </div>
          </div>

          <div className="page-inner" id="app-content">
            <div className="left-side">
              <div className="tag-list">
                <h2 className="tag-list-header">
                  <FormattedMessage id="entry-index.tags" />
                </h2>
                {trendingTags.list.map(t => {
                  const cls = `tag-list-item ${
                    selectedTag === t ? 'selected-item' : ''
                  }`;

                  return (
                    <TagLink {...this.props} tag={t} key={t}>
                      <a className={cls}>{t}</a>
                    </TagLink>
                  );
                })}
              </div>
            </div>

            <div className="right-side">
              <div className={`entry-list ${loading ? 'loading' : ''}`}>
                <div
                  className={`entry-list-body ${
                    global.listStyle === 'grid' ? 'grid-view' : ''
                  }`}
                >
                  {loading && entryList.size === 0 ? (
                    <EntryListLoadingItem />
                  ) : (
                    ''
                  )}
                  {entryList.valueSeq().map((d, i) => {
                    const e = [];
                    if (i % 3 === 0) {
                      const ix = i / 3 - 1;
                      if (promoted[ix] !== undefined) {
                        const p = promoted[ix];

                        e.push(
                          <EntryListItem
                            key={`${p.author}-${p.permlink}-prom`}
                            {...Object.assign({}, this.props, { entry: p })}
                            promoted
                          />
                        );
                      }
                    }

                    e.push(
                      <EntryListItem
                        key={`${d.author}-${d.permlink}`}
                        {...Object.assign({}, this.props, { entry: d })}
                      />
                    );

                    return (
                      <Fragment key={`${d.author}-${d.permlink}`}>
                        {[...e]}
                      </Fragment>
                    );
                  })}
                </div>
              </div>
              {loading && entryList.size > 0 ? <LinearProgress /> : ''}
            </div>
          </div>
        </div>
        <AppFooter {...this.props} />
        <ScrollReplace {...this.props} selector="#app-content" />
        <DeepLinkHandler {...this.props} />
      </div>
    );
  }
}

EntryIndex.defaultProps = {
  activeAccount: null
};

EntryIndex.propTypes = {
  actions: PropTypes.shape({
    fetchEntries: PropTypes.func.isRequired,
    fetchPromotedEntries: PropTypes.func.isRequired,
    invalidateEntries: PropTypes.func.isRequired,
    fetchTrendingTags: PropTypes.func.isRequired,
    changeTheme: PropTypes.func.isRequired,
    changeListStyle: PropTypes.func.isRequired
  }).isRequired,
  global: PropTypes.shape({
    selectedFilter: PropTypes.string.isRequired,
    selectedTag: PropTypes.string.isRequired,
    listStyle: PropTypes.string.isRequired
  }).isRequired,
  entries: PropTypes.shape({}).isRequired,
  promotedEntries: PropTypes.shape({}).isRequired,
  trendingTags: PropTypes.shape({
    list: PropTypes.array.isRequired
  }).isRequired,
  location: PropTypes.shape({}).isRequired,
  history: PropTypes.shape({}).isRequired,
  activeAccount: PropTypes.instanceOf(Object)
};

export default EntryIndex;
