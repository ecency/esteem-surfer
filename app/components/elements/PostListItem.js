// @flow
import React, { Component } from 'react';
import { FormattedRelative } from 'react-intl';

import styles from './PostListItem.less';
import UserAvatar from './UserAvatar';

import catchPostImage from '../../utils/catch-post-image';
import authorReputation from '../../utils/author-reputation';
import parseDate from '../../utils/parse-date';
import postSummary from '../../utils/post-summary';
import sumTotal from '../../utils/sum-total';
import appName from '../../utils/app-name';

type Props = {
  post: {}
};

export default class PostListItem extends Component<Props> {
  props: Props;

  render() {
    const { post } = this.props;
    const img = catchPostImage(post);
    const reputation = authorReputation(post.author_reputation);
    const created = parseDate(post.created);
    const summary = postSummary(post.body, 200);
    const postTotal = sumTotal(post).toFixed(2);
    const voteCount = post.active_votes.length;
    const contentCount = post.children;

    let jsonMeta;
    try {
      jsonMeta = JSON.parse(post.json_metadata);
    } catch (e) {
      jsonMeta = {};
    }

    const app = appName(jsonMeta.app);

    return (
      <div className={styles.postListItem}>
        <div className={styles.itemHeader}>
          <div className={styles.userAvatar}>
            <UserAvatar user={post.author} size="small" />
          </div>
          <span className={styles.author}>
            {post.author}{' '}
            <span className={styles.authorReputation}>{reputation}</span>
          </span>
          <span className={styles.contentCategory}>{post.parent_permlink}</span>
          <span className={styles.contentDate}>
            <FormattedRelative value={created} />
          </span>
        </div>
        <div className={styles.itemBody}>
          <div className={styles.itemImage}>
            <img src={img} alt="" />
          </div>
          <div className={styles.itemSummary}>
            <div className={styles.itemTitle}>{post.title}</div>
            <div className={styles.itemBody}>{summary}</div>
          </div>
          <div className={styles.itemControls}>
            <div className={styles.voting}>
              <a className={styles.btnVote} role="button" tabIndex="-1">
                <i className="mi">keyboard_arrow_up</i>
              </a>
            </div>

            <a className={styles.postTotal}>$ {postTotal}</a>
            <a className={styles.voters}>
              <i className={`mi ${styles.mi}`}>people</i>
              {voteCount}
            </a>
            <a className={styles.comments}>
              <i className={`mi ${styles.mi}`}>comment</i>
              {contentCount}
            </a>
            <div className={styles.app}>{app}</div>
          </div>
        </div>
      </div>
    );
  }
}
