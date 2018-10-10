/*
eslint-disable import/no-cycle
*/

import React, { Component } from 'react';

import PropTypes from 'prop-types';

import { FormattedRelative, FormattedMessage } from 'react-intl';

import UserAvatar from './UserAvatar';
import EntryPayout from './EntryPayout';
import EntryVotes from './EntryVotes';
import EntryVoteBtn from './EntryVoteBtn';
import QuickProfile from '../helpers/QuickProfile';
import FormattedCurrency from './FormattedCurrency';
import AccountLink from '../helpers/AccountLink';

import catchEntryImage from '../../utils/catch-entry-image';
import authorReputation from '../../utils/author-reputation';
import parseDate from '../../utils/parse-date';
import entryBodySummary from '../../utils/entry-body-summary';
import sumTotal from '../../utils/sum-total';
import appName from '../../utils/app-name';
import parseToken from '../../utils/parse-token';

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
    const { entry, inDrawer, asAuthor } = this.props;

    const img = catchEntryImage(entry) || 'img/noimage.png';
    const reputation = authorReputation(entry.author_reputation);
    const created = parseDate(entry.created);
    const summary = entryBodySummary(entry.body, 200);

    const voteCount = entry.active_votes.length;
    const contentCount = entry.children;

    let jsonMeta;
    try {
      jsonMeta = JSON.parse(entry.json_metadata);
    } catch (e) {
      jsonMeta = {};
    }

    const app = appName(jsonMeta.app);

    const totalPayout = sumTotal(entry);
    const isPayoutDeclined = parseToken(entry.max_accepted_payout) === 0;

    const isChild = entry.parent_author !== '';

    const title = isChild ? `RE: ${entry.root_title}` : entry.title;

    return (
      <div className="entry-list-item">
        <div className="item-header">
          {inDrawer && (
            <AccountLink {...this.props} username={entry.author}>
              <div className="author-part">
                <div className="author-avatar">
                  <UserAvatar user={entry.author} size="small" />
                </div>
                <div className="author">
                  {entry.author}{' '}
                  <span className="author-reputation">{reputation}</span>
                </div>
              </div>
            </AccountLink>
          )}

          {!inDrawer && (
            <QuickProfile
              {...this.props}
              username={entry.author}
              reputation={entry.author_reputation}
            >
              <div className="author-part">
                <div className="author-avatar">
                  <UserAvatar user={entry.author} size="small" />
                </div>
                <div className="author">
                  {entry.author}{' '}
                  <span className="author-reputation">{reputation}</span>
                </div>
              </div>
            </QuickProfile>
          )}

          <a
            className="category"
            role="none"
            onClick={() => this.parentClicked(entry.parent_permlink)}
          >
            {entry.category}
          </a>
          <span className="read-mark" />
          <span className="date">
            <FormattedRelative value={created} initialNow={Date.now()} />
          </span>
          {asAuthor &&
            entry.author !== asAuthor && (
              <span className="reblogged">
                <i className="mi">repeat</i>{' '}
                <FormattedMessage id="entry-list-item.reblogged" />
              </span>
            )}
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
            <div className="item-title">{title}</div>
            <div className="item-body">{summary}</div>
          </div>
          <div className="item-controls">
            <div className="voting">
              <EntryVoteBtn {...this.props} entry={entry} />
            </div>
            <EntryPayout {...this.props} entry={entry}>
              <a
                className={`total-payout ${
                  isPayoutDeclined ? 'payout-declined' : ''
                }`}
              >
                <FormattedCurrency {...this.props} value={totalPayout} />
              </a>
            </EntryPayout>
            <EntryVotes {...this.props} entry={entry}>
              <a className="voters">
                <i className="mi">people</i>
                {voteCount}
              </a>
            </EntryVotes>
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

EntryListItem.defaultProps = {
  inDrawer: false,
  asAuthor: null
};

EntryListItem.propTypes = {
  global: PropTypes.shape({
    selectedFilter: PropTypes.string.isRequired
  }).isRequired,
  entry: PropTypes.shape({
    title: PropTypes.string.isRequired,
    parent_permlink: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    author_reputation: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    max_accepted_payout: PropTypes.string.isRequired,
    json_metadata: PropTypes.string.isRequired,
    children: PropTypes.number.isRequired,
    body: PropTypes.string.isRequired,
    created: PropTypes.string.isRequired
  }).isRequired,
  history: PropTypes.shape({}).isRequired,
  location: PropTypes.shape({}).isRequired,
  inDrawer: PropTypes.bool,
  asAuthor: PropTypes.string
};

export default EntryListItem;
