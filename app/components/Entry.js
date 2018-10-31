/*
eslint-disable react/no-multi-comp
*/

import React, {Component, Fragment} from 'react';
import PropTypes from "prop-types";
import {FormattedRelative, FormattedMessage, FormattedHTMLMessage, injectIntl} from "react-intl";

import NavBar from "./layout/NavBar";
import AppFooter from "./layout/AppFooter";
import {getAccount, getState, getContent} from "../backend/steem-client";
import UserAvatar from "./elements/UserAvatar";
import authorReputation from "../utils/author-reputation";
import parseDate from "../utils/parse-date";
import {Select, message} from 'antd';

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


class CommentListItem extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {comment} = this.props;
    const reputation = authorReputation(comment.author_reputation);
    const created = parseDate(comment.created);
    const renderedBody = {__html: markDown2Html(comment.body)};
    const isPayoutDeclined = parseToken(comment.max_accepted_payout) === 0;
    const totalPayout = sumTotal(comment);
    const voteCount = comment.active_votes.length;


    return (
      <div className="comment-list-item">
        <div className="item-inner">
          <div className="item-header">
            <QuickProfile
              {...this.props}
              username={comment.author}
              reputation={reputation}
            >
              <div className="author-part">
                <div className="author-avatar">
                  <UserAvatar user={comment.author} size="medium"/>
                </div>
                <div className="author">
                  <span className="author-name">{comment.author}</span>
                  <span className="author-reputation">{reputation}</span>
                </div>
              </div>
            </QuickProfile>
            <span className="separator"/>
            <span className="date">
              <FormattedRelative value={created} initialNow={Date.now()}/>
            </span>
          </div>
          <div className="item-body markdown-view mini-markdown" dangerouslySetInnerHTML={renderedBody}/>
          <div className="item-controls">
            <div className="voting">
              <EntryVoteBtn {...this.props} entry={comment}/>
            </div>
            <EntryPayout {...this.props} entry={comment}>
              <a
                className={`total-payout ${
                  isPayoutDeclined ? 'payout-declined' : ''
                  }`}
              >
                <FormattedCurrency {...this.props} value={totalPayout}/>
              </a>
            </EntryPayout>
            <span className="separator"/>
            <EntryVotes {...this.props} entry={comment}>
              <a className="voters">
                <i className="mi">people</i>
                {voteCount}
              </a>
            </EntryVotes>
            <span className="separator"/>
            <span className="reply-btn">Reply</span>
          </div>
        </div>
        {comment.comments.length > 0 &&
        <CommentList {...this.props} comments={comment.comments}/>
        }
      </div>
    )
  }
}

CommentListItem.defaultProps = {};

CommentListItem.propTypes = {
  comment: PropTypes.instanceOf(Object).isRequired,
};

class CommentList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {comments} = this.props;
    return (
      <div className="comment-list">
        {comments.map(comment => {
          return <CommentListItem {...this.props} comment={comment} key={comment.id}/>
        })}
      </div>
    )
  }
}


CommentList.defaultProps = {};

CommentList.propTypes = {
  comments: PropTypes.array.isRequired

};


class Entry extends Component {
  constructor(props) {
    super(props);

    const {visitingEntry} = this.props;

    this.state = {
      entry: (visitingEntry ? visitingEntry : null),
      comments: [],
      commentsLoading: true,
      commentSort: 'trending',
      pathData: null
    };
  }


  compileComments = (parent, sortOrder) => {

    const {match} = this.props;
    const {commentId} = match.params;

    const {pathData} = this.state;

    const allPayout = (c) => {
      return parseFloat(c.pending_payout_value.split(' ')[0]) +
        parseFloat(c.total_payout_value.split(' ')[0]) +
        parseFloat(c.curator_payout_value.split(' ')[0]);
    };

    function absNegative(a) {
      return a.net_rshares < 0;
    }

    const sortOrders = {
      trending: (a, b) => {

        if (absNegative(a)) {
          return 1;
        } else if (absNegative(b)) {
          return -1;
        }

        const apayout = allPayout(a);
        const bpayout = allPayout(b);
        if (apayout !== bpayout) {
          return bpayout - apayout;
        }

        return 0;
      },
      author_reputation: (a, b) => {
        const keyA = authorReputation(a.author_reputation),
          keyB = authorReputation(b.author_reputation);

        if (keyA > keyB) return -1;
        if (keyA < keyB) return 1;

        return 0;
      },
      votes: (a, b) => {
        const keyA = a.net_votes,
          keyB = b.net_votes;

        if (keyA > keyB) return -1;
        if (keyA < keyB) return 1;

        return 0;
      },
      created: (a, b) => {
        if (absNegative(a)) {
          return 1;
        } else if (absNegative(b)) {
          return -1;
        }

        const keyA = Date.parse(a.created),
          keyB = Date.parse(b.created);

        if (keyA > keyB) return -1;
        if (keyA < keyB) return 1;

        return 0;
      }
    };


    let comments = [];

    parent.replies.forEach((k) => {
      let reply = pathData.content[k];

      comments.push(
        Object.assign(
          {},
          reply,
          {comments: this.compileComments(reply, sortOrder)},
          {author_data: pathData.accounts[reply.author]},
          {_selected_: reply.id === commentId}
        )
      )
    });

    comments.sort(sortOrders[sortOrder]);

    return comments
  };


  fetch = async () => {
    const {match, actions} = this.props;
    const {category, username, permlink} = match.params;

    const entry = await getContent(username, permlink);

    actions.setVisitingEntry(entry);
    this.setState({entry});

    let contentPath = `${username}/${permlink}`;

    const pathData = await getState(`/${category}/@${username}/${permlink}`);

    this.setState({pathData});

    let content = pathData.content[contentPath];

    const comments = this.compileComments(content, 'trending');

    this.setState({commentsLoading: false, comments})
  };

  commentSortOrderChanged = value => {
    this.setState({commentSort: value});

    const {match} = this.props;
    const {pathData} = this.state;
    const {username, permlink} = match.params;


    let contentPath = `${username}/${permlink}`;
    let content = pathData.content[contentPath];

    const comments = this.compileComments(content, value);
    this.setState({comments});
  };

  async componentDidMount() {

    await this.fetch();


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
    const {comments, commentSort} = this.state;

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
          <Fragment>
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
                    <EntryTag {...this.props} tag={t} key={t}>
                      <div className="entry-tag">
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

              <div className="entry-comments">
                <div className="entry-comments-header">
                  <div className="sort-order">
                    <span className="label">Sort Order</span>
                    <Select defaultValue="trending" size="small" style={{width: '120px'}} value={commentSort}
                            onChange={this.commentSortOrderChanged}>
                      <Select.Option value="trending">Trending</Select.Option>
                      <Select.Option value="author_reputation">Reputation</Select.Option>
                      <Select.Option value="votes">Votes</Select.Option>
                      <Select.Option value="created">Age</Select.Option>
                    </Select>
                  </div>
                </div>
                <div className="entry-comments-body">
                  <CommentList {...this.props} comments={comments}/>
                </div>
              </div>
            </div>
          </Fragment>
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
  actions: PropTypes.shape({
    setVisitingEntry: PropTypes.func.isRequired
  }).isRequired
};

export default injectIntl(Entry);
