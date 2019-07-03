/*
eslint-disable import/no-cycle
*/

import React, { Component, Fragment } from 'react';

import PropTypes from 'prop-types';

import { FormattedRelative, FormattedMessage, injectIntl } from 'react-intl';

import {
  catchPostImage,
  postBodySummary
} from '@esteemapp/esteem-render-helpers';

import UserAvatar from './UserAvatar';
import EntryPayout from './EntryPayout';
import EntryVotes from './EntryVotes';
import EntryVoteBtn from './EntryVoteBtn';
import EntryReblogBtn from './EntryReblogBtn';
import QuickProfile from '../helpers/QuickProfile';
import FormattedCurrency from './FormattedCurrency';
import AccountLink from '../helpers/AccountLink';
import EntryLink from '../helpers/EntryLink';
import TagLink from '../helpers/TagLink';

import authorReputation from '../../utils/author-reputation';
import parseDate from '../../utils/parse-date';
import sumTotal from '../../utils/sum-total';
import appName from '../../utils/app-name';
import parseToken from '../../utils/parse-token';
import { isEntryRead } from '../../helpers/storage';

import fallbackImage from '../../img/fallback.png';
import noImage from '../../img/noimage.png';

class EntryListItem extends Component {
  render() {
    const { entry, inDrawer, asAuthor, global, promoted, intl } = this.props;

    const img =
      (global.listStyle === 'grid'
        ? catchPostImage(entry, 600, 500)
        : catchPostImage(entry, 200, 120)) || noImage;

    const reputation = authorReputation(entry.author_reputation);
    const created = parseDate(entry.created);
    const summary = postBodySummary(entry, 200);

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

    const isVisited = isEntryRead(entry.author, entry.permlink);

    let reBlogged;
    if (asAuthor && asAuthor !== entry.author && !isChild) {
      reBlogged = asAuthor;
    }

    if (entry.reblogged_by && entry.reblogged_by.length > 0) {
      [reBlogged] = entry.reblogged_by;
    }

    const toolTipDate = intl.formatDate(parseDate(entry.created), {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    return (
      <div className={`entry-list-item ${promoted ? 'promoted-item' : ''}`}>
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
          <TagLink {...this.props} tag={entry.category}>
            <a className="category" role="none">
              {entry.category}
            </a>
          </TagLink>
          {!isVisited && <span className="read-mark" />}
          <span className="date" title={toolTipDate}>
            <FormattedRelative
              updateInterval={0}
              value={created}
              initialNow={Date.now()}
            />
          </span>
          {reBlogged && (
            <span className="reblogged">
              <i className="mi">repeat</i>{' '}
              <FormattedMessage
                id="entry-list-item.reblogged"
                values={{ n: reBlogged }}
              />
            </span>
          )}

          {promoted && (
            <Fragment>
              <span className="space" />
              <div className="promoted">promoted</div>
            </Fragment>
          )}
        </div>
        <div className="item-body">
          <div className="item-image">
            <EntryLink
              {...this.props}
              entry={entry}
              author={entry.author}
              permlink={entry.permlink}
            >
              <img
                src={img}
                alt=""
                onError={e => {
                  e.target.src = fallbackImage;
                }}
              />
            </EntryLink>
          </div>
          <div className="item-summary">
            <EntryLink
              {...this.props}
              entry={entry}
              author={entry.author}
              permlink={entry.permlink}
            >
              <div className="item-title">{title}</div>
            </EntryLink>
            <EntryLink
              {...this.props}
              entry={entry}
              author={entry.author}
              permlink={entry.permlink}
            >
              <div className="item-body">{summary}</div>
            </EntryLink>
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
            <EntryLink
              {...this.props}
              entry={entry}
              author={entry.author}
              permlink={entry.permlink}
              toReplies
            >
              <a className="comments">
                <i className="mi">comment</i>
                {contentCount}
              </a>
            </EntryLink>
            <EntryReblogBtn {...this.props} entry={entry} />
            <div className="app">{app}</div>
          </div>
        </div>
      </div>
    );
  }
}

EntryListItem.defaultProps = {
  inDrawer: false,
  asAuthor: null,
  promoted: false
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
  asAuthor: PropTypes.string,
  promoted: PropTypes.bool,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default injectIntl(EntryListItem);
