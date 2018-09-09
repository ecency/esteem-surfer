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
  posts: {},
  trendingTags: {},
  location: {},
  history: {},
  selectedFilter: string,
  selectedTag: string | null,
  listStyle: string
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
    const { selectedFilter, selectedTag } = this.props;
    const { actions } = this.props;

    actions.fetchPosts(selectedFilter, selectedTag, more);
    actions.fetchTrendingTags();
  };

  makeFilterMenu = active => {
    const { selectedTag } = this.props;

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
    const { posts, selectedFilter, selectedTag } = this.props;

    const groupKey = makeGroupKeyForPosts(selectedFilter, selectedTag);
    const data = posts.get(groupKey);
    const loading = data.get('loading');

    if (!loading) {
      this.startFetch(true);
    }
  }

  refresh() {
    const { selectedFilter, selectedTag } = this.props;
    const { actions } = this.props;
    actions.invalidatePosts(selectedFilter, selectedTag);
    actions.fetchPosts(selectedFilter, selectedTag);

    this.scrollEl.scrollTop = 0;
  }

  render() {
    const {
      posts,
      trendingTags,
      selectedFilter,
      selectedTag,
      location,
      history,
      actions,
      listStyle
    } = this.props;

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

    const listSwitchProps = {
      changeStyleFn: actions.changeListStyle,
      listStyle
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
                <ListSwitch {...listSwitchProps} />
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
              {loading && postList.size === 0 ? <PostListLoadingItem /> : ''}

              <div className={listCls}>
                <div
                  className={`post-list-body ${
                    listStyle === 'grid' ? 'grid-view' : ''
                  }`}
                >
                  {postList.valueSeq().map(d => (
                    <PostListItem key={d.id} post={d} />
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
