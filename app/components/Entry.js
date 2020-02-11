/*
eslint-disable react/no-multi-comp, no-underscore-dangle, react/no-danger
*/

import React, { Component, PureComponent, Fragment } from 'react';

import PropTypes from 'prop-types';

import {
  FormattedRelative,
  FormattedMessage,
  FormattedHTMLMessage,
  injectIntl
} from 'react-intl';

import { Select, Button, Popconfirm, message } from 'antd';

import {
  renderPostBody,
  catchPostImage
} from '@esteemapp/esteem-render-helpers';

import Tooltip from './common/Tooltip';

import {
  getState,
  getContent,
  getAccount,
  comment,
  getDiscussions,
  deleteComment
} from '../backend/steem-client';

import {
  addBookmark,
  getBookmarks,
  removeBookmark,
  getCommentHistory
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
import EditHistoryModal from './dialogs/EditHistory';

import parseDate from '../utils/parse-date';
import parseToken from '../utils/parse-token';
import sumTotal from '../utils/sum-total';
import appName from '../utils/app-name';
import authorReputation from '../utils/author-reputation';
import formatChainError from '../utils/format-chain-error';
import { setEntryRead } from '../helpers/storage';

import EntryLink, { makePath as makePathEntry } from './helpers/EntryLink';

import {
  copy as copyIcon,
  reddit as redditIcon,
  twitter as twitterIcon,
  facebook as facebookIcon
} from '../svg';

import {
  createReplyPermlink,
  makeOptions,
  makeJsonMetadataReply
} from '../utils/posting-helpers';

import writeClipboard from '../helpers/clipboard';
import {
  makeEsteemUrl,
  makeCopyAddress,
  makeShareUrlReddit,
  makeShareUrlTwitter,
  makeShareUrlFacebook
} from '../utils/url-share';

import fallbackImage from '../img/fallback.png';
import noImage from '../img/noimage.png';

import { version } from '../../package';
import WordCount from './helpers/WordCount';

class ReplyEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      replyText: '',
      processing: false
    };
  }

  editorChanged = newValues => {
    this.setState({
      replyText: newValues.body.trim()
    });
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
              dangerouslySetInnerHTML={{ __html: renderPostBody(replyText) }}
            />
          </div>
        )}
      </div>
    );
  }
}

ReplyEditor.defaultProps = {
  activeAccount: null,
  global: {
    pin: null
  }
};

ReplyEditor.propTypes = {
  content: PropTypes.instanceOf(Object).isRequired,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  global: PropTypes.shape({
    pin: PropTypes.string
  }),
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
      editorVisible: false,
      deleting: false,
      deleted: false
    };
  }

  delete = () => {
    const { activeAccount, global } = this.props;
    const { reply } = this.state;

    this.setState({ deleting: true });

    return deleteComment(activeAccount, global.pin, reply.permlink)
      .then(resp => {
        this.setState({ deleted: true });
        return resp;
      })
      .catch(err => {
        message.error(formatChainError(err));
      })
      .finally(() => {
        this.setState({ deleting: false });
      });
  };

  afterVote = newObj => {
    const { reply } = this.state;
    const newReply = Object.assign({}, reply, {
      active_votes: newObj.active_votes
    });
    this.setState({ reply: newReply });
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
    const { depth, activeAccount, intl } = this.props;
    const { reply, editorVisible, editorMode, deleted, deleting } = this.state;

    const reputation = authorReputation(reply.author_reputation);
    const created = parseDate(reply.created);
    const renderedBody = { __html: renderPostBody(reply) };
    const isPayoutDeclined = parseToken(reply.max_accepted_payout) === 0;
    const totalPayout = sumTotal(reply);
    const voteCount = reply.active_votes.length;
    const canEdit = activeAccount && activeAccount.username === reply.author;

    const toolTipDate = intl.formatDate(parseDate(reply.created), {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    if (deleted) {
      return null;
    }

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
                  <UserAvatar
                    {...this.props}
                    user={reply.author}
                    size="medium"
                  />
                </div>
                <div className="author">
                  <span className="author-name">{reply.author}</span>
                  <span className="author-reputation">{reputation}</span>
                </div>
              </div>
            </QuickProfile>
            <span className="separator" />
            <span className="date" title={toolTipDate}>
              <FormattedRelative
                updateInterval={0}
                value={created}
                initialNow={Date.now()}
              />
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
            {canEdit && (
              <Fragment>
                <span className="separator" />
                <Popconfirm
                  title={intl.formatMessage({ id: 'g.are-you-sure' })}
                  okText={intl.formatMessage({ id: 'g.ok' })}
                  cancelText={intl.formatMessage({ id: 'g.cancel' })}
                  onConfirm={() => {
                    this.delete();
                  }}
                >
                  <span
                    className={`delete-btn ${deleting ? 'deleting' : ''}`}
                    role="none"
                  >
                    <i className="mi">delete</i>
                  </span>
                </Popconfirm>
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

        {(() => {
          if (reply.replies && reply.replies.length > 0) {
            if (depth >= 8) {
              return (
                <div className="item-show-more">
                  <EntryLink
                    {...this.props}
                    author={reply.author}
                    permlink={reply.permlink}
                  >
                    <a>
                      <FormattedMessage id="entry.more-replies" />
                    </a>
                  </EntryLink>
                </div>
              );
            }

            return (
              <ReplyList
                {...this.props}
                replies={reply.replies}
                depth={depth + 1}
              />
            );
          }
        })()}
      </div>
    );
  }
}

ReplyListItem.defaultProps = {
  activeAccount: null,
  global: {
    pin: null
  }
};

ReplyListItem.propTypes = {
  depth: PropTypes.number.isRequired,
  reply: PropTypes.instanceOf(Object).isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  intl: PropTypes.instanceOf(Object).isRequired,
  global: PropTypes.shape({
    pin: PropTypes.string
  })
};

class ReplyList extends PureComponent {
  render() {
    const { replies, depth } = this.props;

    return (
      <div className="entry-reply-list">
        {replies.map(reply => (
          <ReplyListItem
            {...this.props}
            reply={reply}
            key={`${reply.author}-${reply.permlink}`}
            depth={depth}
          />
        ))}
      </div>
    );
  }
}

ReplyList.defaultProps = {};

ReplyList.propTypes = {
  depth: PropTypes.number.isRequired,
  replies: PropTypes.arrayOf(Object).isRequired
};

class EntryFloatingMenu extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      editHistoryVisible: false,
      editHistoryActive: false
    };
  }

  componentDidMount() {
    const { entry } = this.props;

    return getCommentHistory(entry.author, entry.permlink, true).then(resp => {
      this.setState({ editHistoryVisible: resp.meta.count > 1 });
      return resp;
    });
  }

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

  toggleEditHistory = () => {
    const { editHistoryActive } = this.state;
    this.setState({ editHistoryActive: !editHistoryActive });
  };

  render() {
    const { entry, intl } = this.props;
    const { editHistoryVisible, editHistoryActive } = this.state;

    const eSteemUrl = makeEsteemUrl(
      entry.category,
      entry.author,
      entry.permlink
    );

    return (
      <div className="entry-floating-menu">
        <EntryReblogBtn {...this.props} entry={entry} showDetail />

        {editHistoryVisible && (
          <Tooltip
            title={intl.formatMessage({ id: 'entry.show-edit-history' })}
            mouseEnterDelay={1}
            placement="right"
          >
            <a
              className="menu-item copy-btn"
              onClick={this.toggleEditHistory}
              role="none"
            >
              <i className="mi">history</i>
            </a>
          </Tooltip>
        )}
        <a
          className="menu-item share-btn no-ex-icon"
          target="_external"
          href={eSteemUrl}
        >
          <i className="mi">open_in_new</i>
        </a>
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
            {copyIcon}
          </a>
        </Tooltip>
        <div className="menu-item with-sub-menu share-social">
          <i className="mi">share</i>
          <div className="sub-menu">
            <a className="sub-menu-item" onClick={this.shareReddit} role="none">
              {redditIcon}
            </a>
            <a
              className="sub-menu-item"
              onClick={this.shareTwitter}
              role="none"
            >
              {twitterIcon}
            </a>
            <a
              className="sub-menu-item"
              onClick={this.shareFacebook}
              role="none"
            >
              {facebookIcon}
            </a>
          </div>
        </div>
        {editHistoryActive && (
          <EditHistoryModal
            {...this.props}
            onCancel={this.toggleEditHistory}
            visible
          />
        )}
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
      editorVisible: true,
      bookmarkId: null,
      clickedAuthor: null,
      similarEntries: [],
      similarLoading: false,
      deleting: false
    };

    const { match } = this.props;
    const { category, username, permlink } = match.params;

    this.statePath = `/${category}/@${username}/${permlink}`;
    this.entryPath = `${username}/${permlink}`;
    this.stateData = null;
  }

  async componentDidMount() {
    this.mounted = true;

    await this.fetch();

    const { match, location } = this.props;
    const { username, permlink } = match.params;
    setEntryRead(username, permlink);

    const { hash } = location;
    if (hash === '#replies') {
      this.scrollToReplies();
    }

    window.addEventListener('md-author-clicked', this.mdAuthorClicked);
    window.addEventListener('md-post-clicked', this.mdEntryClicked);
    window.addEventListener('md-tag-clicked', this.mdTagClicked);
    window.addEventListener('md-witnesses-clicked', this.mdWitnessesClicked);
    window.addEventListener('md-proposal-clicked', this.mdProposalClicked);
  }

  componentWillUnmount() {
    window.removeEventListener('md-author-clicked', this.mdAuthorClicked);
    window.removeEventListener('md-post-clicked', this.mdEntryClicked);
    window.removeEventListener('md-tag-clicked', this.mdTagClicked);
    window.removeEventListener('md-witnesses-clicked', this.mdWitnessesClicked);
    window.removeEventListener('md-proposal-clicked', this.mdProposalClicked);

    this.mounted = false;
  }

  mounted = false;

  stateSet = (obj, cb = undefined) => {
    if (this.mounted) {
      this.setState(obj, cb);
    }
  };

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

    // It might be undefined if newly created.
    if (!parent || !parent.replies) {
      return [];
    }

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

  fetchSimilar = () => {
    const { match, activeAccount } = this.props;
    const { permlink } = match.params;
    const { entry } = this.state;
    const activeUsername = activeAccount ? activeAccount.username : null;

    this.stateSet({ similarLoading: true });
    return getDiscussions('hot', { tag: entry.parent_permlink, limit: 30 })
      .then(resp => {
        const s = resp
          .filter(r => r.permlink !== permlink)
          // exclude active user's posts
          .filter(r => r.author !== activeUsername)
          // shuffle
          .map(a => [Math.random(), a])
          .sort((a, b) => a[0] - b[0])
          .map(a => a[1]);

        this.stateSet({ similarEntries: s.slice(0, 3) });
        return resp;
      })
      .finally(() => {
        this.stateSet({ similarLoading: false });
      });
  };

  fetch = async () => {
    const { intl } = this.props;

    this.stateSet({ replies: [], repliesLoading: true, replySort: 'trending' });

    const { match, actions, activeAccount } = this.props;
    const { username, permlink } = match.params;

    if (activeAccount) {
      getBookmarks(activeAccount.username)
        .then(bookmarks => {
          const b = bookmarks.filter(
            x => x.author === username && x.permlink === permlink
          );

          this.stateSet({ bookmarkId: b.length ? b[0]._id : null });
          return bookmarks;
        })
        .catch(() => {});
    }

    const entry = await getContent(username, permlink);

    actions.setVisitingEntry(entry);

    this.stateSet({ entry });

    this.fetchSimilar();

    try {
      this.stateData = await getState(this.statePath);
    } catch (err) {
      this.stateData = null;
      message.error(intl.formatMessage({ id: 'entry.fetch-error' }));
    }

    if (this.stateData) {
      const theEntry = this.stateData.content[this.entryPath];
      const replies = this.compileReplies(theEntry, 'trending');
      this.stateSet({ replies });
    }

    this.stateSet({ repliesLoading: false });
  };

  refresh = async () => {
    await this.fetch();
  };

  replySortOrderChanged = value => {
    this.stateSet({ replySort: value });

    const theEntry = this.stateData.content[this.entryPath];
    const replies = this.compileReplies(theEntry, value);
    this.stateSet({ replies });
  };

  mdAuthorClicked = async e => {
    const { author } = e.detail;

    const data = await getAccount(author);

    this.stateSet({ clickedAuthor: data }, () => {
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

  mdWitnessesClicked = () => {
    const { history } = this.props;
    const newLoc = '/witnesses';
    history.push(newLoc);
  };

  mdProposalClicked = e => {
    const { actions, history } = this.props;
    const { proposal } = e.detail;

    actions.tempSet({
      type: 'sps',
      proposal
    });

    const newLoc = '/sps';
    history.push(newLoc);
  };

  toggleReplyForm = () => {
    const { editorVisible } = this.state;
    this.stateSet({ editorVisible: !editorVisible });
  };

  edit = () => {
    const { entry } = this.state;
    const { history } = this.props;

    const { author, permlink } = entry;

    history.push(`/edit/@${author}/${permlink}`);
  };

  delete = () => {
    const { activeAccount, global, history } = this.props;
    const { entry } = this.state;

    this.stateSet({ deleting: true });

    return deleteComment(activeAccount, global.pin, entry.permlink)
      .then(resp => {
        history.push(`@${activeAccount.username}/feed`);
        return resp;
      })
      .catch(err => {
        message.error(formatChainError(err));
      })
      .finally(() => {
        this.stateSet({ deleting: false });
      });
  };

  onNewReply = newReply => {
    const { replies } = this.state;
    const newReplies = [newReply, ...replies];
    this.stateSet({ replies: newReplies });
  };

  afterVote = entry => {
    this.stateSet({ entry });
  };

  bookmarkFn = () => {
    const { bookmarkId } = this.state;
    const { activeAccount, match, intl } = this.props;
    const { username, permlink } = match.params;

    if (bookmarkId) {
      return removeBookmark(bookmarkId, activeAccount.username).then(resp => {
        this.stateSet({ bookmarkId: null });
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
        this.stateSet({ bookmarkId: b.length ? b[0]._id : null });
        message.success(intl.formatMessage({ id: 'entry.bookmarked' }));
        return resp;
      }
    );
  };

  scrollToReplies = () => {
    const replyWrapper = document.querySelector('.entry-replies');
    const scrollEl = document.querySelector('#app-content');

    if (!replyWrapper || !scrollEl) {
      return;
    }

    scrollEl.scrollTop = replyWrapper.offsetTop;
  };

  promoteClicked = () => {
    const { history, activeAccount } = this.props;
    const { entry } = this.state;
    const u = `/@${activeAccount.username}/promote/${entry.author}/${
      entry.permlink
    }`;

    history.push(u);
  };

  boostClicked = () => {
    const { history, activeAccount } = this.props;
    const { entry } = this.state;
    const u = `/@${activeAccount.username}/boost/${entry.author}/${
      entry.permlink
    }`;

    history.push(u);
  };

  render() {
    const {
      entry,
      repliesLoading,
      editorVisible,
      bookmarkId,
      similarEntries,
      similarLoading
    } = this.state;
    const { intl } = this.props;

    let content = null;
    if (entry) {
      const { children } = entry;

      const { replies, replySort, clickedAuthor, deleting } = this.state;

      const reputation = authorReputation(entry.author_reputation);
      const created = parseDate(entry.created);
      const renderedBody = { __html: renderPostBody(entry) };

      let jsonMeta;
      try {
        jsonMeta = JSON.parse(entry.json_metadata);
      } catch (e) {
        jsonMeta = {};
      }

      const tags = [...new Set(jsonMeta.tags)]; // Sometimes tag list comes with duplicate items
      const app = appName(jsonMeta.app);
      const totalPayout = sumTotal(entry);
      const isPayoutDeclined = parseToken(entry.max_accepted_payout) === 0;
      const voteCount = entry.active_votes.length;

      const { activeAccount } = this.props;

      const isComment = entry.parent_author.trim().length > 0;

      const editable =
        activeAccount && !isComment && activeAccount.username === entry.author;

      const deletable =
        activeAccount && activeAccount.username === entry.author;

      const canRedeem =
        !isComment && activeAccount && activeAccount.username === entry.author;

      const hideParentLink = !entry.parent_permlink.startsWith('re-');

      const rootUrl = entry.url.split('#')[0];
      const [, , rootAuthor, rootPermlink] = rootUrl.split('/');

      const toolTipDate = intl.formatDate(parseDate(entry.created), {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

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
                      <UserAvatar
                        {...this.props}
                        user={entry.author}
                        size="medium"
                      />
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
                <span className="date" title={toolTipDate}>
                  {intl.formatRelative(created)}
                </span>
                <span className="h-space" />
                <WordCount selector=".entry-body" />
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
                  <div className="date" title={toolTipDate}>
                    <i className="mi">access_time</i>
                    {intl.formatRelative(created)}
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

                  {deletable && (
                    <Fragment>
                      <span className="separator" />
                      <Popconfirm
                        title={intl.formatMessage({ id: 'g.are-you-sure' })}
                        okText={intl.formatMessage({ id: 'g.ok' })}
                        cancelText={intl.formatMessage({ id: 'g.cancel' })}
                        onConfirm={() => {
                          this.delete();
                        }}
                      >
                        <span
                          className={`delete-btn ${deleting ? 'deleting' : ''}`}
                          role="none"
                        >
                          <FormattedMessage id="g.delete" />
                        </span>
                      </Popconfirm>
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

                {canRedeem && (
                  <Fragment>
                    <div className="space" />
                    <div className="redeem">
                      <div className="promote">
                        <Button
                          size="small"
                          type="primary"
                          onClick={this.promoteClicked}
                        >
                          <FormattedMessage id="entry.promote" />
                        </Button>
                      </div>
                      <div className="boost">
                        <Button
                          size="small"
                          type="primary"
                          onClick={this.boostClicked}
                        >
                          <FormattedMessage id="entry.boost" />
                        </Button>
                      </div>
                    </div>
                  </Fragment>
                )}
              </div>
            </div>
            {similarEntries.length === 3 && (
              <div className="similar-entries-list">
                <div className="similar-entries-list-header">
                  <div className="list-header-text">
                    <i className="mi">list</i>{' '}
                    <FormattedMessage id="entry.similar-entries" />
                  </div>
                  <a
                    role="none"
                    className={`reload-entries ${
                      similarLoading ? 'reloading' : ''
                    }`}
                    onClick={this.fetchSimilar}
                  >
                    <i className="mi">refresh</i>
                  </a>
                </div>
                <div className="similar-entries-list-body">
                  {similarEntries.map(en => {
                    const enImg = catchPostImage(en, 300, 200) || noImage;
                    const enCreated = parseDate(en.created);
                    return (
                      <EntryLink
                        {...this.props}
                        entry={en}
                        author={en.author}
                        permlink={en.permlink}
                        key={`${en.author}-${en.permlink}`}
                      >
                        <div className="similar-entries-list-item">
                          <div className="item-title">{en.title}</div>
                          <div className="item-image">
                            <img
                              src={enImg}
                              alt=""
                              onError={e => {
                                e.target.src = fallbackImage;
                              }}
                            />
                          </div>
                          <div className="item-footer">
                            <span className="item-footer-author">
                              {en.author}
                            </span>
                            <span className="item-footer-date">
                              <FormattedRelative
                                updateInterval={0}
                                value={enCreated}
                                initialNow={Date.now()}
                              />
                            </span>
                            <span className="item-footer-comment-count">
                              <i className="mi">comment</i> {en.children}
                            </span>
                          </div>
                        </div>
                      </EntryLink>
                    );
                  })}
                </div>
              </div>
            )}
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
                <ReplyList {...this.props} replies={replies} depth={1} />
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
  location: PropTypes.instanceOf(Object).isRequired,
  history: PropTypes.instanceOf(Object).isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  visitingEntry: PropTypes.instanceOf(Object),
  global: PropTypes.shape({
    selectedFilter: PropTypes.string.isRequired
  }).isRequired,
  actions: PropTypes.shape({
    setVisitingEntry: PropTypes.func.isRequired,
    tempSet: PropTypes.func.isRequired
  }).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default injectIntl(Entry);
