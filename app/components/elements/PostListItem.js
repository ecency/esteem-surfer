// @flow
import React, { Component } from 'react';
import styles from './PostListItem.less';
import UserAvatar from './UserAvatar';

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
          <div className={styles.userAvatar}>
            <UserAvatar user={post.author} size="small" />
          </div>

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
