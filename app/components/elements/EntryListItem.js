import React, { Component } from 'react';

import PropTypes from 'prop-types';

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

class EntryListItem extends Component {
  parentClicked = parent => {
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
    const { entry } = this.props;

    const img = catchPostImage(entry) || 'img/noimage.png';
    const reputation = authorReputation(entry.author_reputation);
    const created = parseDate(entry.created);
    const summary = postSummary(entry.body, 200);

    const voteCount = entry.active_votes.length;
    const contentCount = entry.children;

    let jsonMeta;
    try {
      jsonMeta = JSON.parse(entry.json_metadata);
    } catch (e) {
      jsonMeta = {};
    }

    const app = appName(jsonMeta.app);

    const totalPayout = sumTotal(entry).toFixed(2);
    const isPayoutDeclined = parseMoney(entry.max_accepted_payout) === 0;

    return (
      <div className="entry-list-item">
        <div className="item-header">
          <div className="author-avatar">
            <UserAvatar user={entry.author} size="small" />
          </div>
          <span className="author">
            {entry.author}{' '}
            <span className="author-reputation">{reputation}</span>
          </span>
          <a
            className="category"
            role="none"
            onClick={() => this.parentClicked(entry.parent_permlink)}
          >
            {entry.parent_permlink}
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
            <div className="item-title">{entry.title}</div>
            <div className="item-body">{summary}</div>
          </div>
          <div className="item-controls">
            <div className="voting">
              <a className="btn-vote" role="button" tabIndex="-1">
                <i className="mi">keyboard_arrow_up</i>
              </a>
            </div>
            <PayoutInfo entry={entry}>
              <a
                className={`total-payout ${
                  isPayoutDeclined ? 'payout-declined' : ''
                }`}
              >
                $ {totalPayout}
              </a>
            </PayoutInfo>
            <VotersInfo entry={entry}>
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

EntryListItem.propTypes = {
  global: PropTypes.shape({
    selectedFilter: PropTypes.string.isRequired
  }).isRequired,
  entry: PropTypes.shape({
    title: PropTypes.string.isRequired,
    parent_permlink: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    author_reputation: PropTypes.string.isRequired,
    max_accepted_payout: PropTypes.string.isRequired,
    json_metadata: PropTypes.string.isRequired,
    children: PropTypes.number.isRequired,
    body: PropTypes.string.isRequired,
    created: PropTypes.string.isRequired
  }).isRequired,
  history: PropTypes.shape({}).isRequired,
  location: PropTypes.shape({}).isRequired
};

export default EntryListItem;
