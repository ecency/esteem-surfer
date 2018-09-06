// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';
import { FormattedMessage } from 'react-intl';

import { makeGroupKeyForPosts } from '../utils/misc';
import styles from './PostIndex.less';
import PostListItem from './elements/PostListItem';
import NavBar from './modules/NavBar';
import AppFooter from './modules/AppFooter';
import Mi from './elements/Mi';
import ScrollReplace from './ScrollReplace';

import DropDown from './elements/DropDown';
import filters from '../constants/filters.json';
import LinearProgress from './elements/LinearProgress';

type Props = {
  actions: {
    fetchPosts: () => void,
    fetchTrendingTags: () => void,
    invalidatePosts: () => void
  },
  posts: {},
  trendingTags: {},
  location: {},
  history: {},
  selectedFilter: string,
  selectedTag: string | null
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

    this.scrollEl = document.querySelector('#scrollMain');
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
      history
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
      reloadFn: this.refresh,
      reloading: loading
    };

    const listCls = `${styles.postList} ${loading ? styles.loading : ''}`;

    return (
      <div className="wrapper">
        <ScrollReplace
          {...Object.assign({}, this.props, { selector: '#scrollMain' })}
        />

        <NavBar {...navBarProps} />

        <div className="appContainer" id="scrollMain">
          <div className={styles.side}>
            <div className={styles.tagList}>
              <div className={styles.tagListHeader}>
                <FormattedMessage id="post-index.tags" />
              </div>
              {trendingTags.list.map(tag => {
                const cls = `${styles.tagListItem} ${
                  selectedTag === tag ? ` ${styles.selectedItem}` : ''
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

          <div className={styles.content}>
            <div className={listCls}>
              <div className={styles.postListHeader}>
                <div className={styles.filterSelect}>
                  <span className={styles.label}>
                    <FormattedMessage
                      id={`post-index.filter-${selectedFilter}`}
                    />
                  </span>
                  <DropDown menu={filterMenu} location={location} />
                </div>
                <a className={styles.listSwitch}>
                  <Mi icon="view_module" />
                </a>
              </div>
              <div className={styles.postListBody}>
                {postList.valueSeq().map(d => (
                  <PostListItem key={d.id} post={d} />
                ))}
              </div>

              {loading ? <LinearProgress /> : ''}
            </div>
          </div>
        </div>

        <AppFooter />
      </div>
    );
  }
}
