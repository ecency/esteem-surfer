// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';
import { FormattedMessage } from 'react-intl';

import { makeGroupKeyForPosts } from '../utils/misc';
import filters from '../constants/filters.json';

import NavBar from './modules/NavBar';
import AppFooter from './modules/AppFooter';

import PostListItem from './elements/PostListItem';
import PostListLoadingItem from './elements/PostListLoadingItem';

import DropDown from './elements/DropDown';
import ListSwitch from './elements/ListSwitch';
import LinearProgress from './elements/LinearProgress';
import Mi from './elements/Mi';

import ScrollReplace from './ScrollReplace';

type Props = {
  actions: {
    fetchPosts: () => void,
    fetchTrendingTags: () => void,
    invalidatePosts: () => void,
    changeTheme: () => void,
    changeListStyle: () => void
  },
  global: {},
  posts: {},
  trendingTags: {},
  location: {},
  history: {}
};

export default class PostIndex extends Component<Props> {
  props: Props;

  constructor(props: Props) {
    super(props);

    this.detectScroll = this.detectScroll.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  componentDidMount() {
    this.startFetch();

    this.scrollEl = document.querySelector('#app-content');
    if (this.scrollEl) {
      this.scrollEl.addEventListener('scroll', this.detectScroll);
    }
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props;

    if (location !== prevProps.location) {
      this.startFetch();
    }
  }

  startFetch = (more: boolean = false) => {
    const { global, actions } = this.props;
    const { selectedFilter, selectedTag } = global;

    actions.fetchPosts(selectedFilter, selectedTag, more);
    actions.fetchTrendingTags();
  };

  makeFilterMenu = active => {
    const { global } = this.props;
    const { selectedTag } = global;

    return (
      <Menu selectedKeys={[active]}>
        {filters.map(filter => (
          <Menu.Item key={filter}>
            <Link to={selectedTag ? `/${filter}/${selectedTag}` : `/${filter}`}>
              <FormattedMessage id={`post-index.filter-${filter}`} />
            </Link>
          </Menu.Item>
        ))}
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
    const { global, posts } = this.props;
    const { selectedFilter, selectedTag } = global;

    const groupKey = makeGroupKeyForPosts(selectedFilter, selectedTag);
    const data = posts.get(groupKey);
    const loading = data.get('loading');
    const hasMore = data.get('hasMore');

    if (!loading && hasMore) {
      this.startFetch(true);
    }
  }

  refresh() {
    const { global, actions } = this.props;
    const { selectedFilter, selectedTag } = global;

    actions.invalidatePosts(selectedFilter, selectedTag);
    actions.fetchPosts(selectedFilter, selectedTag);

    this.scrollEl.scrollTop = 0;
  }

  render() {
    const {
      posts,
      trendingTags,
      location,
      history,
      actions,
      global
    } = this.props;

    const { selectedFilter, selectedTag } = global;

    const filterMenu = this.makeFilterMenu(selectedFilter);
    const groupKey = makeGroupKeyForPosts(selectedFilter, selectedTag);

    const data = posts.get(groupKey);
    const postList = data.get('entries');
    const loading = data.get('loading');

    const navBarProps = {
      selectedFilter,
      history,
      location,
      changeThemeFn: actions.changeTheme,
      reloadFn: this.refresh,
      reloading: loading
    };

    const listCls = `post-list ${loading ? 'loading' : ''}`;

    return (
      <div className="wrapper">
        <ScrollReplace
          {...Object.assign({}, this.props, { selector: '#app-content' })}
        />

        <NavBar {...navBarProps} />

        <div className="app-content post-index">
          <div className="page-header">
            <div className="left-side">
              <div className="btn-post">
                <span className="icon">
                  <Mi icon="edit" />
                </span>
                <FormattedMessage id="g.create-post" />
              </div>
            </div>

            <div className="right-side">
              <div className={`page-tools ${loading ? 'loading' : ''}`}>
                <div className="filter-select">
                  <span className="label">
                    <FormattedMessage
                      id={`post-index.filter-${selectedFilter}`}
                    />
                  </span>
                  <DropDown menu={filterMenu} location={location} />
                </div>
                <ListSwitch {...this.props} />
              </div>
              {loading && postList.size === 0 ? <LinearProgress /> : ''}
            </div>
          </div>

          <div className="page-inner" id="app-content">
            <div className="left-side">
              <div className="tag-list">
                <h2 className="tag-list-header">
                  <FormattedMessage id="post-index.tags" />
                </h2>
                {trendingTags.list.map(tag => {
                  const cls = `tag-list-item ${
                    selectedTag === tag ? 'selected-item' : ''
                  }`;
                  const to = `/${selectedFilter}/${tag}`;
                  return (
                    <Link to={to} className={cls} key={tag}>
                      {tag}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="right-side">
              <div className={listCls}>
                <div
                  className={`post-list-body ${
                    global.listStyle === 'grid' ? 'grid-view' : ''
                  }`}
                >
                  {loading && postList.size === 0 ? (
                    <PostListLoadingItem />
                  ) : (
                    ''
                  )}
                  {postList.valueSeq().map(d => (
                    <PostListItem
                      key={d.id}
                      selectedFilter={selectedFilter}
                      history={history}
                      location={location}
                      post={d}
                    />
                  ))}
                </div>
              </div>
              {loading && postList.size > 0 ? <LinearProgress /> : ''}
            </div>
          </div>
        </div>

        <AppFooter />
      </div>
    );
  }
}
