/*
eslint-disable react/no-multi-comp, no-underscore-dangle
*/

import React, { Component, PureComponent, Fragment } from 'react';

import PropTypes from 'prop-types';

import {
  FormattedRelative,
  FormattedMessage,
  FormattedHTMLMessage,
  injectIntl
} from 'react-intl';

import { Select, Button, Tooltip, message } from 'antd';

import {
  getState,
  getContent,
  getAccount,
  comment
} from '../backend/steem-client';

import {
  addBookmark,
  getBookmarks,
  removeBookmark
} from '../backend/esteem-client';

import NavBar from './layout/NavBar';
import AppFooter from './layout/AppFooter';
import UserAvatar from './elements/UserAvatar';
import QuickProfile from './helpers/QuickProfile';
import TagLink, { makePath as makePathTag } from './helpers/TagLink';
import ScrollReplace from './helpers/ScrollReplace';
import EntryVoteBtn from './elements/EntryVoteBtn';
import EntryPayout from './elements/EntryPayout';
import FormattedCurrency from './elements/FormattedCurrency';
import EntryVotes from './elements/EntryVotes';
import LinearProgress from './common/LinearProgress';
import Editor from './elements/Editor';
import LoginRequired from './helpers/LoginRequired';
import DeepLinkHandler from './helpers/DeepLinkHandler';
import EntryReblogBtn from './elements/EntryReblogBtn';

import parseDate from '../utils/parse-date';
import parseToken from '../utils/parse-token';
import sumTotal from '../utils/sum-total';
import appName from '../utils/app-name';
import markDown2Html from '../utils/markdown-2-html';
import authorReputation from '../utils/author-reputation';
import formatChainError from '../utils/format-chain-error';
import { setEntryRead } from '../helpers/storage';

import EntryLink, { makePath as makePathEntry } from './helpers/EntryLink';

import {
  createReplyPermlink,
  makeOptions,
  makeJsonMetadataReply
} from '../utils/posting-helpers';

import writeClipboard from '../helpers/clipboard';
import {
  makeSteemitUrl,
  makeBusyUrl,
  makeCopyAddress,
  makeShareUrlReddit,
  makeShareUrlTwitter,
  makeShareUrlFacebook
} from '../utils/url-share';

import { version } from '../../package';

class ReplyEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      replyText: '',
      processing: false
    };
  }

  editorChanged = newValues => {
    if (this.changeTimer !== null) {
      this.changeTimer = null;
      clearTimeout(this.changeTimer);
    }

    this.changeTimer = setTimeout(() => {
      this.setState({
        replyText: newValues.body.trim()
      });

      this.changeTimer = null;
    }, 300);
  };

  cancel = () => {
    const { onCancel } = this.props;
    onCancel();
  };

  submit = async () => {
    this.setState({ processing: true });

    const { content, onSuccess, activeAccount, global, mode } = this.props;
    const { replyText } = this.state;

    let parentJsonMeta;
    try {
      parentJsonMeta = JSON.parse(content.json_metadata);
    } catch (e) {
      parentJsonMeta = {};
    }

    let parentAuthor = null;
    let parentPermlink = null;
    let author = null;
    let permlink = null;
    let options = null;

    const jsonMeta = makeJsonMetadataReply(
      parentJsonMeta.tags || ['esteem'],
      version
    );

    if (mode === 'edit') {
      parentAuthor = content.parent_author;
      parentPermlink = content.parent_permlink;
      ({ author } = content);
      ({ permlink } = content);

      const bExist = content.beneficiaries.some(
        x => x && x.account === 'esteemapp'
      );
      if (!bExist) {
        options = makeOptions(author, permlink);
      }
    } else if (mode === 'reply') {
      parentAuthor = content.author;
      parentPermlink = content.permlink;
      author = activeAccount.username;
      permlink = createReplyPermlink(content.author);
      options = makeOptions(author, permlink);
    }

    let newContent;

    try {
      await comment(
        activeAccount,
        global.pin,
        parentAuthor,
        parentPermlink,
        permlink,
        '',
        replyText,
        jsonMeta,
        options,
        0
      );

      newContent = await getContent(author, permlink);
    } catch (err) {
      message.error(formatChainError(err));
      return;
    }

    this.setState({ processing: false });
    onSuccess(newContent);
  };

  render() {
    const { intl, mode, content } = this.props;
    const { replyText, processing } = this.state;
    const defaultBody = mode === 'edit' ? content.body : '';
    const btnLabel =
      mode === 'reply'
        ? intl.formatMessage({ id: 'entry.reply' })
        : intl.formatMessage({ id: 'g.save' });

    return (
      <div className="reply-editor">
        <Editor
          {...this.props}
          defaultValues={{
            title: '',
            tags: [],
            body: defaultBody
          }}
          onChange={this.editorChanged}
          syncWith={null}
          mode="reply"
          autoFocus2Body
          bodyPlaceHolder={intl.formatMessage({
            id: 'entry.reply-body-placeholder'
          })}
        />
        <div className="reply-editor-controls">
          <Button
            size="small"
            className="btn-cancel"
            onClick={this.cancel}
            disabled={processing}
          >
            Cancel
          </Button>
          <LoginRequired {...this.props} requiredKeys={['posting']}>
            <Button
              size="small"
              className="btn-reply"
              type="primary"
              onClick={this.submit}
              disabled={!replyText}
              loading={processing}
            >
              {btnLabel}
            </Button>
          </LoginRequired>
        </div>
        {replyText && (
          <div className="reply-editor-preview">
            <div className="preview-label">
              <FormattedMessage id="entry.reply-preview" />
            </div>
            <div
              className="markdown-view mini-markdown user-selectable no-click-event"
              dangerouslySetInnerHTML={{ __html: markDown2Html(replyText) }}
            />
          </div>
        )}
      </div>
    );
  }
}

ReplyEditor.defaultProps = {
  activeAccount: null
};

ReplyEditor.propTypes = {
  content: PropTypes.instanceOf(Object).isRequired,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  global: PropTypes.shape({
    pin: PropTypes.string.isRequired
  }).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired,
  mode: PropTypes.string.isRequired
};

class ReplyListItem extends PureComponent {
  constructor(props) {
    super(props);

    const { reply } = this.props;

    this.state = {
      reply,
      editorMode: null,
      editorVisible: false
    };
  }

  afterVote = entry => {
    this.setState({ reply: entry });
  };

  onReplySuccess = newObj => {
    const { reply, editorMode } = this.state;

    let newReply;

    if (editorMode === 'reply') {
      const { replies } = reply;

      const newReplies = [newObj, ...replies];
      newReply = Object.assign({}, reply, { replies: newReplies });
    } else if (editorMode === 'edit') {
      newReply = Object.assign({}, reply, { body: newObj.body });
    }

    this.setState({ reply: newReply, editorVisible: false, editorMode: null });
  };

  onCancel = () => {
    this.setState({ editorVisible: false, editorMode: null });
  };

  openEditor = mode => {
    const { editorVisible, editorMode } = this.state;
    if (editorVisible && editorMode === mode) return;

    this.setState({ editorVisible: false });

    setTimeout(() => {
      this.setState({ editorVisible: true, editorMode: mode });
    }, 50);
  };

  render() {
    const { activeAccount } = this.props;
    const { reply, editorVisible, editorMode } = this.state;

    const reputation = authorReputation(reply.author_reputation);
    const created = parseDate(reply.created);
    const renderedBody = { __html: markDown2Html(reply.body) };
    const isPayoutDeclined = parseToken(reply.max_accepted_payout) === 0;
    const totalPayout = sumTotal(reply);
    const voteCount = reply.active_votes.length;
    const canEdit = activeAccount && activeAccount.username === reply.author;

    return (
      <div className="reply-list-item">
        <div className="item-inner">
          <div className="item-header">
            <QuickProfile
              {...this.props}
              username={reply.author}
              reputation={reputation}
            >
              <div className="author-part">
                <div className="author-avatar">
                  <UserAvatar user={reply.author} size="medium" />
                </div>
                <div className="author">
                  <span className="author-name">{reply.author}</span>
                  <span className="author-reputation">{reputation}</span>
                </div>
              </div>
            </QuickProfile>
            <span className="separator" />
            <span className="date">
              <FormattedRelative value={created} initialNow={Date.now()} />
            </span>
          </div>
          <div
            className="item-body markdown-view mini-markdown user-selectable"
            dangerouslySetInnerHTML={renderedBody}
          />
          <div className="item-controls">
            <div className="voting">
              <EntryVoteBtn
                {...this.props}
                entry={reply}
                afterVote={this.afterVote}
              />
            </div>
            <EntryPayout {...this.props} entry={reply}>
              <a
                className={`total-payout ${
                  isPayoutDeclined ? 'payout-declined' : ''
                }`}
              >
                <FormattedCurrency {...this.props} value={totalPayout} />
              </a>
            </EntryPayout>
            <span className="separator" />
            <EntryVotes {...this.props} entry={reply}>
              <a className="voters">
                <i className="mi">people</i>
                {voteCount}
              </a>
            </EntryVotes>
            <span className="separator" />
            <span
              className="reply-btn"
              role="none"
              onClick={() => {
                this.openEditor('reply');
              }}
            >
              <FormattedMessage id="entry.reply" />
            </span>
            {canEdit && (
              <Fragment>
                <span className="separator" />
                <span
                  className="edit-btn"
                  role="none"
                  onClick={() => {
                    this.openEditor('edit');
                  }}
                >
                  <i className="mi">edit</i>{' '}
                </span>
              </Fragment>
            )}
          </div>
        </div>

        {editorVisible && (
          <ReplyEditor
            {...this.props}
            content={reply}
            onCancel={this.onCancel}
            onSuccess={this.onReplySuccess}
            mode={editorMode}
          />
        )}
        {reply.replies &&
          reply.replies.length > 0 && (
            <ReplyList {...this.props} replies={reply.replies} />
          )}
      </div>
    );
  }
}

ReplyListItem.defaultProps = {
  activeAccount: null
};

ReplyListItem.propTypes = {
  reply: PropTypes.instanceOf(Object).isRequired,
  activeAccount: PropTypes.instanceOf(Object)
};

class ReplyList extends PureComponent {
  render() {
    const { replies } = this.props;

    return (
      <div className="entry-reply-list">
        {replies.map(reply => (
          <ReplyListItem {...this.props} reply={reply} key={reply.id} />
        ))}
      </div>
    );
  }
}

ReplyList.defaultProps = {};

ReplyList.propTypes = {
  replies: PropTypes.arrayOf(Object).isRequired
};

class EntryFloatingMenu extends PureComponent {
  copyClipboard = () => {
    const { entry, intl } = this.props;
    const s = makeCopyAddress(
      entry.title,
      entry.category,
      entry.author,
      entry.permlink
    );
    writeClipboard(s);
    message.success(intl.formatMessage({ id: 'entry.copied-clipboard' }));
  };

  shareReddit = () => {
    const { entry } = this.props;
    const u = makeShareUrlReddit(
      entry.category,
      entry.author,
      entry.permlink,
      entry.title
    );
    window.openInBrowser(u);
  };

  shareTwitter = () => {
    const { entry } = this.props;
    const u = makeShareUrlTwitter(
      entry.category,
      entry.author,
      entry.permlink,
      entry.title
    );
    window.openInBrowser(u);
  };

  shareFacebook = () => {
    const { entry } = this.props;
    const u = makeShareUrlFacebook(
      entry.category,
      entry.author,
      entry.permlink
    );
    window.openInBrowser(u);
  };

  render() {
    const { entry, intl } = this.props;

    const steemitUrl = makeSteemitUrl(
      entry.category,
      entry.author,
      entry.permlink
    );
    const busyUrl = makeBusyUrl(entry.author, entry.permlink);

    return (
      <div className="entry-floating-menu">
        <EntryReblogBtn {...this.props} entry={entry} />

        <div className="menu-item with-sub-menu share-btn">
          <i className="mi">open_in_new</i>
          <div className="sub-menu">
            <a className="sub-menu-item" target="_external" href={steemitUrl}>
              steemit
            </a>
            <a className="sub-menu-item" target="_external" href={busyUrl}>
              busy
            </a>
          </div>
        </div>
        <Tooltip
          title={intl.formatMessage({ id: 'entry.copy-clipboard' })}
          mouseEnterDelay={1}
          placement="right"
        >
          <a
            className="menu-item copy-btn"
            onClick={this.copyClipboard}
            role="none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
            >
              <path fill="none" d="M0 0h24v24H0z" />
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm-1 4l6 6v10c0 1.1-.9 2-2 2H7.99C6.89 23 6 22.1 6 21l.01-14c0-1.1.89-2 1.99-2h7zm-1 7h5.5L14 6.5V12z" />
            </svg>
          </a>
        </Tooltip>
        <div className="menu-item with-sub-menu share-social">
          <i className="mi">share</i>
          <div className="sub-menu">
            <a className="sub-menu-item" onClick={this.shareReddit} role="none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
              >
                <path d="M2.204 14.049c-.06.276-.091.56-.091.847 0 3.443 4.402 6.249 9.814 6.249 5.41 0 9.812-2.804 9.812-6.249 0-.274-.029-.546-.082-.809l-.015-.032c-.021-.055-.029-.11-.029-.165-.302-1.175-1.117-2.241-2.296-3.103-.045-.016-.088-.039-.126-.07-.026-.02-.045-.042-.067-.064-1.792-1.234-4.356-2.008-7.196-2.008-2.815 0-5.354.759-7.146 1.971-.014.018-.029.033-.049.049-.039.033-.084.06-.13.075-1.206.862-2.042 1.937-2.354 3.123 0 .058-.014.114-.037.171l-.008.015zm9.773 5.441c-1.794 0-3.057-.389-3.863-1.197-.173-.174-.173-.457 0-.632.176-.165.46-.165.635 0 .63.629 1.685.943 3.228.943 1.542 0 2.591-.3 3.219-.929.165-.164.45-.164.629 0 .165.18.165.465 0 .645-.809.808-2.065 1.198-3.862 1.198l.014-.028zm-3.606-7.573c-.914 0-1.677.765-1.677 1.677 0 .91.763 1.65 1.677 1.65s1.651-.74 1.651-1.65c0-.912-.739-1.677-1.651-1.677zm7.233 0c-.914 0-1.678.765-1.678 1.677 0 .91.764 1.65 1.678 1.65s1.651-.74 1.651-1.65c0-.912-.739-1.677-1.651-1.677zm4.548-1.595c1.037.833 1.8 1.821 2.189 2.904.45-.336.719-.864.719-1.449 0-1.002-.815-1.816-1.818-1.816-.399 0-.778.129-1.09.363v-.002zM2.711 9.963c-1.003 0-1.817.816-1.817 1.818 0 .543.239 1.048.644 1.389.401-1.079 1.172-2.053 2.213-2.876-.302-.21-.663-.329-1.039-.329v-.002zm9.217 12.079c-5.906 0-10.709-3.205-10.709-7.142 0-.275.023-.544.068-.809C.494 13.598 0 12.729 0 11.777c0-1.496 1.227-2.713 2.725-2.713.674 0 1.303.246 1.797.682 1.856-1.191 4.357-1.941 7.112-1.992l1.812-5.524.404.095s.016 0 .016.002l4.223.993c.344-.798 1.138-1.36 2.065-1.36 1.229 0 2.231 1.004 2.231 2.234 0 1.232-1.003 2.234-2.231 2.234s-2.23-1.004-2.23-2.23l-3.851-.912-1.467 4.477c2.65.105 5.047.854 6.844 2.021.494-.464 1.144-.719 1.833-.719 1.498 0 2.718 1.213 2.718 2.711 0 .987-.54 1.886-1.378 2.365.029.255.059.494.059.749-.015 3.938-4.806 7.143-10.72 7.143l-.034.009zm8.179-19.187c-.74 0-1.34.599-1.34 1.338 0 .738.6 1.34 1.34 1.34.732 0 1.33-.6 1.33-1.334 0-.733-.598-1.332-1.347-1.332l.017-.012z" />
              </svg>
            </a>
            <a
              className="sub-menu-item"
              onClick={this.shareTwitter}
              role="none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
              >
                <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z" />
              </svg>
            </a>
            <a
              className="sub-menu-item"
              onClick={this.shareFacebook}
              role="none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
              >
                <path d="M22.676 0H1.324C.593 0 0 .593 0 1.324v21.352C0 23.408.593 24 1.324 24h11.494v-9.294H9.689v-3.621h3.129V8.41c0-3.099 1.894-4.785 4.659-4.785 1.325 0 2.464.097 2.796.141v3.24h-1.921c-1.5 0-1.792.721-1.792 1.771v2.311h3.584l-.465 3.63H16.56V24h6.115c.733 0 1.325-.592 1.325-1.324V1.324C24 .593 23.408 0 22.676 0" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    );
  }
}

EntryFloatingMenu.propTypes = {
  entry: PropTypes.instanceOf(Object).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

class Entry extends PureComponent {
  constructor(props) {
    super(props);

    const { visitingEntry } = this.props;

    this.state = {
      entry: visitingEntry || null,
      replies: [],
      repliesLoading: true,
      replySort: 'trending',
      editorVisible: false,
      bookmarkId: null,
      clickedAuthor: null
    };

    const { match } = this.props;
    const { category, username, permlink } = match.params;

    this.statePath = `/${category}/@${username}/${permlink}`;
    this.entryPath = `${username}/${permlink}`;
    this.stateData = null;
  }

  async componentDidMount() {
    await this.fetch();

    const { match } = this.props;
    const { username, permlink } = match.params;
    setEntryRead(username, permlink);

    window.addEventListener('md-author-clicked', this.mdAuthorClicked);
    window.addEventListener('md-post-clicked', this.mdEntryClicked);
    window.addEventListener('md-tag-clicked', this.mdTagClicked);
  }

  componentWillUnmount() {
    window.removeEventListener('md-author-clicked', this.mdAuthorClicked);
    window.removeEventListener('md-post-clicked', this.mdEntryClicked);
    window.removeEventListener('md-tag-clicked', this.mdTagClicked);
  }

  compileReplies = (parent, sortOrder) => {
    const { match } = this.props;
    const { replyId } = match.params;

    const allPayout = c =>
      parseFloat(c.pending_payout_value.split(' ')[0]) +
      parseFloat(c.total_payout_value.split(' ')[0]) +
      parseFloat(c.curator_payout_value.split(' ')[0]);

    const absNegative = a => a.net_rshares < 0;

    const sortOrders = {
      trending: (a, b) => {
        if (absNegative(a)) {
          return 1;
        }

        if (absNegative(b)) {
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
        const keyA = authorReputation(a.author_reputation);
        const keyB = authorReputation(b.author_reputation);

        if (keyA > keyB) return -1;
        if (keyA < keyB) return 1;

        return 0;
      },
      votes: (a, b) => {
        const keyA = a.net_votes;
        const keyB = b.net_votes;

        if (keyA > keyB) return -1;
        if (keyA < keyB) return 1;

        return 0;
      },
      created: (a, b) => {
        if (absNegative(a)) {
          return 1;
        }

        if (absNegative(b)) {
          return -1;
        }

        const keyA = Date.parse(a.created);
        const keyB = Date.parse(b.created);

        if (keyA > keyB) return -1;
        if (keyA < keyB) return 1;

        return 0;
      }
    };

    const replies = [];

    parent.replies.forEach(k => {
      const reply = this.stateData.content[k];

      replies.push(
        Object.assign(
          {},
          reply,
          { replies: this.compileReplies(reply, sortOrder) },
          { author_data: this.stateData.accounts[reply.author] },
          { _selected_: reply.id === replyId }
        )
      );
    });

    replies.sort(sortOrders[sortOrder]);

    return replies;
  };

  fetch = async () => {
    this.setState({ replies: [], repliesLoading: true, replySort: 'trending' });

    const { match, actions, activeAccount } = this.props;
    const { username, permlink } = match.params;

    if (activeAccount) {
      getBookmarks(activeAccount.username)
        .then(bookmarks => {
          const b = bookmarks.filter(
            x => x.author === username && x.permlink === permlink
          );

          this.setState({ bookmarkId: b.length ? b[0]._id : null });
          return bookmarks;
        })
        .catch(() => {});
    }

    const entry = await getContent(username, permlink);

    actions.setVisitingEntry(entry);

    this.setState({ entry });

    this.stateData = await getState(this.statePath);

    const theEntry = this.stateData.content[this.entryPath];

    const replies = this.compileReplies(theEntry, 'trending');

    this.setState({ repliesLoading: false, replies });
  };

  refresh = async () => {
    await this.fetch();
  };

  replySortOrderChanged = value => {
    this.setState({ replySort: value });

    const theEntry = this.stateData.content[this.entryPath];
    const replies = this.compileReplies(theEntry, value);
    this.setState({ replies });
  };

  mdAuthorClicked = async e => {
    const { author } = e.detail;

    const data = await getAccount(author);

    this.setState({ clickedAuthor: data }, () => {
      setTimeout(() => {
        document.querySelector('#clicked-author').click();
      }, 10);
    });
  };

  mdEntryClicked = e => {
    const { history } = this.props;
    const { category, author, permlink } = e.detail;

    const newLoc = makePathEntry(category, author, permlink);

    history.push(newLoc);
  };

  mdTagClicked = e => {
    const { history, global } = this.props;
    const { tag } = e.detail;
    const { selectedFilter } = global;

    const newLoc = makePathTag(selectedFilter, tag);

    history.push(newLoc);
  };

  toggleReplyForm = () => {
    const { editorVisible } = this.state;
    this.setState({ editorVisible: !editorVisible });
  };

  edit = () => {
    const { entry } = this.state;
    const { history } = this.props;

    const { author, permlink } = entry;

    history.push(`/edit/@${author}/${permlink}`);
  };

  onNewReply = newReply => {
    const { replies } = this.state;
    const newReplies = [newReply, ...replies];
    this.setState({ replies: newReplies });
  };

  afterVote = entry => {
    this.setState({ entry });
  };

  bookmarkFn = () => {
    const { bookmarkId } = this.state;
    const { activeAccount, match, intl } = this.props;
    const { username, permlink } = match.params;

    if (bookmarkId) {
      return removeBookmark(bookmarkId, activeAccount.username).then(resp => {
        this.setState({ bookmarkId: null });
        message.info(intl.formatMessage({ id: 'entry.bookmarkRemoved' }));
        return resp;
      });
    }

    return addBookmark(activeAccount.username, username, permlink).then(
      resp => {
        const { bookmarks } = resp;
        const b = bookmarks.filter(
          x => x.author === username && x.permlink === permlink
        );
        this.setState({ bookmarkId: b.length ? b[0]._id : null });
        message.success(intl.formatMessage({ id: 'entry.bookmarked' }));
        return resp;
      }
    );
  };

  render() {
    const { entry, repliesLoading, editorVisible, bookmarkId } = this.state;

    let content = null;
    if (entry) {
      const { children } = entry;

      const { replies, replySort, clickedAuthor } = this.state;

      const reputation = authorReputation(entry.author_reputation);
      const created = parseDate(entry.created);
      const renderedBody = { __html: markDown2Html(entry.body) };

      let jsonMeta;
      try {
        jsonMeta = JSON.parse(entry.json_metadata);
      } catch (e) {
        jsonMeta = {};
      }

      const tags = [...new Set(jsonMeta.tags)].slice(0, 5); // Sometimes tag list comes with duplicate items
      const app = appName(jsonMeta.app);
      const totalPayout = sumTotal(entry);
      const isPayoutDeclined = parseToken(entry.max_accepted_payout) === 0;
      const voteCount = entry.active_votes.length;

      const { activeAccount } = this.props;

      const editable = activeAccount && activeAccount.username === entry.author;

      const isComment = entry.parent_author.trim().length > 0;
      const hideParentLink = !entry.parent_permlink.startsWith('re-');

      const rootUrl = entry.url.split('#')[0];
      const [, , rootAuthor, rootPermlink] = rootUrl.split('/');

      content = (
        <Fragment>
          <div className="the-entry">
            <div className="entry-header">
              {isComment && (
                <div className="comment-entry-header">
                  <div className="comment-entry-header-title">
                    {' '}
                    RE: {entry.root_title}
                  </div>
                  <div className="comment-entry-header-info">
                    <FormattedMessage id="entry.comment-entry-title" />
                  </div>
                  <p className="comment-entry-root-title">
                    {' '}
                    {entry.root_title}
                  </p>
                  <ul className="comment-entry-opts">
                    <li>
                      <EntryLink
                        {...this.props}
                        author={rootAuthor.replace('@', '')}
                        permlink={rootPermlink}
                      >
                        <a>
                          <FormattedMessage id="entry.comment-entry-go-root" />
                        </a>
                      </EntryLink>
                    </li>
                    {!hideParentLink && (
                      <li>
                        <EntryLink
                          {...this.props}
                          author={entry.parent_author}
                          permlink={entry.parent_permlink}
                        >
                          <a>
                            <FormattedMessage id="entry.comment-entry-go-parent" />
                          </a>
                        </EntryLink>
                      </li>
                    )}
                  </ul>
                </div>
              )}
              <h1 className="entry-title user-selectable">{entry.title}</h1>
              <div className="entry-info">
                <QuickProfile
                  {...this.props}
                  username={entry.author}
                  reputation={entry.author_reputation}
                >
                  <div className="author-part">
                    <div className="author-avatar">
                      <UserAvatar user={entry.author} size="medium" />
                    </div>
                    <div className="author">
                      <span className="author-name">{entry.author}</span>
                      <span className="author-reputation">{reputation}</span>
                    </div>
                  </div>
                </QuickProfile>
                <TagLink {...this.props} tag={entry.category}>
                  <a className="category" role="none">
                    {entry.category}
                  </a>
                </TagLink>
                <span className="separator" />
                <span className="date">
                  <FormattedRelative value={created} initialNow={Date.now()} />
                </span>
              </div>
            </div>
            <div
              className="entry-body markdown-view user-selectable"
              dangerouslySetInnerHTML={renderedBody}
            />
            <div className={`entry-footer ${repliesLoading ? 'loading' : ''}`}>
              <div className="entry-tags">
                {tags.map(t => (
                  <TagLink {...this.props} tag={t} key={t}>
                    <div className="entry-tag">{t}</div>
                  </TagLink>
                ))}
              </div>
              <div className="entry-info">
                <div className="left-side">
                  <div className="date">
                    <i className="mi">access_time</i>
                    <FormattedRelative
                      value={created}
                      initialNow={Date.now()}
                    />
                  </div>
                  <span className="separator" />
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
                  {app && (
                    <Fragment>
                      <span className="separator" />
                      <div className="app">
                        <FormattedHTMLMessage
                          id="entry.via-app"
                          values={{ app }}
                        />
                      </div>
                    </Fragment>
                  )}
                </div>
                <div className="right-side">
                  <span
                    className="reply-btn"
                    role="none"
                    onClick={this.toggleReplyForm}
                  >
                    <FormattedMessage id="entry.reply" />
                  </span>

                  {editable && (
                    <Fragment>
                      <span className="separator" />
                      <span
                        className="edit-btn"
                        role="none"
                        onClick={this.edit}
                      >
                        <FormattedMessage id="g.edit" />
                      </span>
                    </Fragment>
                  )}
                </div>
              </div>
              <div className="entry-controls">
                <div className="voting">
                  <EntryVoteBtn
                    {...this.props}
                    entry={entry}
                    afterVote={this.afterVote}
                  />
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
              </div>
            </div>
            {repliesLoading && <LinearProgress />}

            {editorVisible && (
              <ReplyEditor
                {...this.props}
                content={entry}
                onCancel={this.toggleReplyForm}
                onSuccess={newReply => {
                  this.toggleReplyForm();
                  this.onNewReply(newReply);
                }}
                mode="reply"
              />
            )}
            <div className="clearfix" />
            <div className="entry-replies">
              <div className="entry-replies-header">
                <div className="reply-count">
                  <i className="mi">comment</i>
                  <FormattedMessage
                    id="entry.n-replies"
                    values={{ n: children }}
                  />
                </div>
                {replies.length > 0 && (
                  <div className="sort-order">
                    <span className="label">
                      <FormattedMessage id="entry.reply-sort-order" />
                    </span>
                    <Select
                      defaultValue="trending"
                      size="small"
                      style={{ width: '120px' }}
                      value={replySort}
                      onChange={this.replySortOrderChanged}
                    >
                      <Select.Option value="trending">
                        <FormattedMessage id="entry.reply-sort-order-trending" />
                      </Select.Option>
                      <Select.Option value="author_reputation">
                        <FormattedMessage id="entry.reply-sort-order-reputation" />
                      </Select.Option>
                      <Select.Option value="votes">
                        <FormattedMessage id="entry.reply-sort-order-votes" />
                      </Select.Option>
                      <Select.Option value="created">
                        <FormattedMessage id="entry.reply-sort-order-created" />
                      </Select.Option>
                    </Select>
                  </div>
                )}
              </div>

              <div className="entry-replies-body">
                <ReplyList {...this.props} replies={replies} />
              </div>
            </div>
          </div>

          {clickedAuthor && (
            <div style={{ display: 'none' }}>
              <QuickProfile
                {...this.props}
                username={clickedAuthor.name}
                reputation={clickedAuthor.reputation}
              >
                <a id="clicked-author">{clickedAuthor.name}</a>
              </QuickProfile>
            </div>
          )}

          <EntryFloatingMenu {...this.props} entry={entry} />
        </Fragment>
      );
    }

    return (
      <div className="wrapper">
        <NavBar
          {...this.props}
          reloadFn={this.refresh}
          reloading={repliesLoading}
          bookmarkFn={this.bookmarkFn}
          bookmarkFlag={!!bookmarkId}
          postBtnActive
        />
        <div className="app-content entry-page" id="app-content">
          {content}
        </div>
        <AppFooter {...this.props} />
        <ScrollReplace {...this.props} selector="#app-content" />
        <DeepLinkHandler {...this.props} />
      </div>
    );
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
  }).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default injectIntl(Entry);
