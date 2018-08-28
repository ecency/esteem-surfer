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

import DropDown from './elements/DropDown';
import filters from '../constants/filters.json';

type Props = {
  actions: {
    fetchPosts: () => void,
    fetchTrendingTags: () => void
  },
  posts: {},
  trendingTags: {},
  location: {},
  selectedFilter: string,
  selectedTag: string | null
};

export default class PostIndex extends Component<Props> {
  props: Props;

  componentDidMount() {
    this.startFetch();
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props;

    if (location !== prevProps.location) {
      this.startFetch();

      // Scroll main container to top
      document.querySelector('.appContainer').scrollTop = 0;
    }
  }

  startFetch = () => {
    const { selectedFilter, selectedTag } = this.props;
    const { actions } = this.props;

    actions.fetchPosts(selectedFilter, selectedTag);
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

  render() {
    const {
      posts,
      trendingTags,
      selectedFilter,
      selectedTag,
      location
    } = this.props;

    const groupKey = makeGroupKeyForPosts(selectedFilter, selectedTag);

    let postList = [];
    // let loading = false;
    if (posts.groups[groupKey]) {
      postList = [...posts.groups[groupKey].data];
      // loading = posts.loading;
    }

    const filterMenu = this.makeFilterMenu(selectedFilter);

    return (
      <div className="wrapper">
        <NavBar {...this.props} />

        <div className="appContainer">
          <div className={styles.side}>
            <div className={styles.btnPost}>
              <span className={styles.icon}>
                <Mi icon="edit" />
              </span>
              <FormattedMessage id="g.create-post" />
            </div>

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
            <div className={styles.postList}>
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
              {postList.map(d => (
                <PostListItem key={d.id} content={d} />
              ))}
            </div>
          </div>
        </div>

        <AppFooter />
      </div>
    );
  }
}
