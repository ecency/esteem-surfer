// @flow
import React, { Component } from 'react';
import { FormattedRelative } from 'react-intl';

import UserAvatar from './UserAvatar';
import PayoutInfo from './PayoutInfo';
import VotersInfo from './VotersInfo';

import catchPostImage from '../../utils/catch-post-image';
import authorReputation from '../../utils/author-reputation';
import parseDate from '../../utils/parse-date';
import postSummary from '../../utils/post-summary';
import sumTotal from '../../utils/sum-total';
import appName from '../../utils/app-name';
import parseMoney from '../../utils/parse-money';

type Props = {
  global: {},
  post: {},
  history: {},
  location: {}
};

export default class PostListItem extends Component<Props> {
  props: Props;

  parentClicked = (parent: string) => {
    const { global, location, history } = this.props;
    const { selectedFilter } = global;
    const newLoc = `/${selectedFilter}/${parent}`;

    if (location.pathname === newLoc) {
      document.querySelector('#app-content').scrollTop = 0;
      return;
    }

    history.push(newLoc);
  };

  render() {
    const { post } = this.props;
    const img = catchPostImage(post) || 'img/noimage.png';
    const reputation = authorReputation(post.author_reputation);
    const created = parseDate(post.created);
    const summary = postSummary(post.body, 200);

    const voteCount = post.active_votes.length;
    const contentCount = post.children;

    let jsonMeta;
    try {
      jsonMeta = JSON.parse(post.json_metadata);
    } catch (e) {
      jsonMeta = {};
    }

    const app = appName(jsonMeta.app);

    const postTotal = sumTotal(post).toFixed(2);
    const isPayoutDeclined = parseMoney(post.max_accepted_payout) === 0;

    return (
      <div className="post-list-item">
        <div className="item-header">
          <div className="author-avatar">
            <UserAvatar user={post.author} size="small" />
          </div>
          <span className="author">
            {post.author}{' '}
            <span className="author-reputation">{reputation}</span>
          </span>
          <a
            className="category"
            role="none"
            onClick={() => this.parentClicked(post.parent_permlink)}
          >
            {post.parent_permlink}
          </a>
          <span className="read-mark" />
          <span className="date">
            <FormattedRelative value={created} />
          </span>
        </div>
        <div className="item-body">
          <div className="item-image">
            <img
              src={img}
              alt=""
              onError={e => {
                e.target.src = 'img/fallback.png';
              }}
            />
          </div>
          <div className="item-summary">
            <div className="item-title">{post.title}</div>
            <div className="item-body">{summary}</div>
          </div>
          <div className="item-controls">
            <div className="voting">
              <a className="btn-vote" role="button" tabIndex="-1">
                <i className="mi">keyboard_arrow_up</i>
              </a>
            </div>
            <PayoutInfo content={post}>
              <a
                className={`post-total ${
                  isPayoutDeclined ? 'payout-declined' : ''
                }`}
              >
                $ {postTotal}
              </a>
            </PayoutInfo>
            <VotersInfo content={post}>
              <a className="voters">
                <i className="mi">people</i>
                {voteCount}
              </a>
            </VotersInfo>
            <a className="comments">
              <i className="mi">comment</i>
              {contentCount}
            </a>
            <div className="app">{app}</div>
          </div>
        </div>
      </div>
    );
  }
}
