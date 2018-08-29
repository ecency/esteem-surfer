// @flow
import React, { Component } from 'react';
import styles from './PostListItem.less';

import catchPostImage from '../../utils/catch-post-image';

type Props = {
  post: {}
};

export default class PostListItem extends Component<Props> {
  props: Props;

  render() {
    const { post } = this.props;
    const img = catchPostImage(post);

    return (
      <div className={styles.contentListItem}>
        <div className={styles.itemHeader}>
          <span
            className={styles.authorAvatar}
            style={{
              backgroundImage:
                "url('https://steemitimages.com/u/good-karma/avatar/small')"
            }}
          />
          <span className={styles.author}>
            {post.author} <span className={styles.authorReputation}>72</span>
          </span>
          <span className={styles.contentCategory}>{post.parent_permlink}</span>
          <span className={styles.contentDate}>27 minutes ago</span>
        </div>
        <div className={styles.itemBody}>
          <div className={styles.itemImage}>
            <img src={img} alt="" />
          </div>
          <div className={styles.itemSummary}>
            <div className={styles.itemTitle}>{post.title}</div>
            <div className={styles.itemBody} />
          </div>
        </div>
      </div>
    );
  }
}
