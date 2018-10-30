/*
eslint-disable react/no-multi-comp
*/

import React, {Component} from 'react';
import PropTypes from "prop-types";
import {FormattedRelative, FormattedMessage, FormattedHTMLMessage, injectIntl} from "react-intl";

import NavBar from "./layout/NavBar";
import AppFooter from "./layout/AppFooter";
import {getAccount, getState} from "../backend/steem-client";
import UserAvatar from "./elements/UserAvatar";
import authorReputation from "../utils/author-reputation";
import parseDate from "../utils/parse-date";

import markDown2Html from '../utils/markdown-2-html';
import QuickProfile from "./helpers/QuickProfile";
import appName from "../utils/app-name";
import EntryTag from './elements/EntryTag';
import ScrollReplace from "./helpers/ScrollReplace";
import EntryVoteBtn from "./elements/EntryVoteBtn";
import EntryPayout from "./elements/EntryPayout";
import FormattedCurrency from "./elements/FormattedCurrency";
import EntryVotes from "./elements/EntryVotes";
import parseToken from "../utils/parse-token";
import sumTotal from "../utils/sum-total";

class Entry extends Component {
  constructor(props) {
    super(props);

    const {visitingEntry} = this.props;

    this.state = {
      entry: (visitingEntry ? visitingEntry : null),
      comments: [],
      commentsLoading: true,
    };
  }

  componentDidMount() {
    const {match} = this.props;

    window.addEventListener('md-author-clicked', this.mdAuthorClicked);
    window.addEventListener('md-post-clicked', this.mdEntryClicked);
    window.addEventListener('md-tag-clicked', this.mdTagClicked);
  }

  componentWillUnmount() {
    window.removeEventListener('md-author-clicked', this.mdAuthorClicked);
    window.removeEventListener('md-post-clicked', this.mdEntryClicked);
    window.removeEventListener('md-tag-clicked', this.mdTagClicked);
  }

  mdAuthorClicked = (e) => {
    const {history} = this.props;
    const {author} = e.detail;

    history.push(`/@${author}`);
  };

  mdEntryClicked = (e) => {


    console.log(e.detail.category, e.detail.author, e.detail.permlink);
  };

  mdTagClicked = (e) => {

    const {global} = this.props;
    const {selectedFilter} = global;

    console.log(selectedFilter)
    // console.log(e.detail.tag);
  };


  refresh = () => {

  };


  render() {


    const {entry} = this.state;

    let reputation;
    let created;
    let renderedBody;
    let tags = [];
    let app;
    let isPayoutDeclined;
    let totalPayout;
    let voteCount;

    if (entry) {
      reputation = authorReputation(entry.author_reputation);
      created = parseDate(entry.created);

      renderedBody = {__html: markDown2Html(entry.body)};

      let jsonMeta;
      try {
        jsonMeta = JSON.parse(entry.json_metadata);
      } catch (e) {
        jsonMeta = {};
      }

      // Sometimes tag list comes with duplicate items. Needs to singularize
      tags = [...new Set(jsonMeta.tags)];


      app = appName(jsonMeta.app);

      totalPayout = sumTotal(entry);
      isPayoutDeclined = parseToken(entry.max_accepted_payout) === 0;
      voteCount = entry.active_votes.length;
    }


    const loading = false;

    return (
      <div className="wrapper">

        <NavBar
          {...this.props}
          reloadFn={() => {
            this.refresh();
          }}
          reloading={loading}
          bookmarkFn={() => {
          }}
          postBtnActive
        />
        <div className="app-content entry-page" id="app-content">
          {entry &&
          <div className="the-entry">
            <div className="entry-header">
              <h1 className="entry-title">{entry.title}</h1>
              <div className="entry-info">
                <QuickProfile
                  {...this.props}
                  username={entry.author}
                  reputation={entry.author_reputation}
                >
                  <div className="author-part">
                    <div className="author-avatar">
                      <UserAvatar user={entry.author} size="medium"/>
                    </div>
                    <div className="author">
                      <span className="author-name">{entry.author}</span>
                      <span className="author-reputation">{reputation}</span>
                    </div>
                  </div>
                </QuickProfile>
                <EntryTag {...this.props} tag={entry.category}>
                  <a
                    className="category"
                    role="none"
                  >{entry.category}</a>
                </EntryTag>
                <span className="separator"/>
                <span className="date">
                  <FormattedRelative value={created} initialNow={Date.now()}/>
                </span>
              </div>
            </div>
            <div className="entry-body markdown-view" dangerouslySetInnerHTML={renderedBody}/>
            <div className="entry-footer">
              <div className="entry-tags">
                {tags.map(t => (
                  <EntryTag {...this.props} tag={t}>
                    <div key={t} className="entry-tag">
                      {t}
                    </div>
                  </EntryTag>
                ))}
              </div>
              <div className="entry-info">
                <div className="left-side">
                  <div className="date">
                    <i className="mi">access_time</i>
                    <FormattedRelative value={created} initialNow={Date.now()}/>
                  </div>

                  <span className="separator"/>

                  <QuickProfile
                    {...this.props}
                    username={entry.author}
                    reputation={entry.author_reputation}
                  >
                    <div className="author">
                      <span className="author-name">{entry.author}</span>
                      <span className="author-reputation">{reputation}</span>
                    </div>
                  </QuickProfile>

                  <span className="separator"/>

                  <div className="app">
                    <FormattedHTMLMessage id="entry.via-app" values={{app}}/>
                  </div>
                </div>
                <div className="right-side">
                  <div className="reply-btn"><FormattedMessage id="entry.reply"/></div>
                  <div className="comments-count"><i className="mi">comment</i>{entry.children}</div>
                </div>
              </div>
              <div className="entry-controls">
                <div className="voting">
                  <EntryVoteBtn {...this.props} entry={entry}/>
                </div>
                <EntryPayout {...this.props} entry={entry}>
                  <a
                    className={`total-payout ${
                      isPayoutDeclined ? 'payout-declined' : ''
                      }`}
                  >
                    <FormattedCurrency {...this.props} value={totalPayout}/>
                  </a>
                </EntryPayout>
                <EntryVotes {...this.props} entry={entry}>
                  <a className="voters">
                    <i className="mi">people</i>
                    {voteCount}
                  </a>
                </EntryVotes>
              </div>
            </div>
          </div>
          }
        </div>
        <AppFooter {...this.props} />
        <ScrollReplace {...this.props} selector="#app-content"/>
      </div>
    )
  }
}


Entry.defaultProps = {
  activeAccount: null,
  visitingEntry: null
};

Entry.propTypes = {
  match: PropTypes.instanceOf(Object).isRequired,
  history: PropTypes.instanceOf(Object).isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  visitingEntry: PropTypes.instanceOf(Object),
  global: PropTypes.shape({
    selectedFilter: PropTypes.string.isRequired
  }).isRequired,
};

export default injectIntl(Entry);
