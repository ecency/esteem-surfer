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

    const filterMenu = this.makeFilterMenu(selectedFilter);
    const groupKey = makeGroupKeyForPosts(selectedFilter, selectedTag);

    const data = posts.groups[groupKey];
    const postList = [...data.entries];
    const { loading } = data;

    return (
      <div className="wrapper">
        <ScrollReplace
          {...Object.assign({}, this.props, { selector: '#scrollMain' })}
        />

        <NavBar {...this.props} />

        <div className="appContainer" id="scrollMain">
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
                <PostListItem key={d.id} post={d} />
              ))}

              {loading ? <LinearProgress /> : ''}
            </div>
          </div>
        </div>

        <AppFooter />
      </div>
    );
  }
}
