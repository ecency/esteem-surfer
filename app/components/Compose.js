/*
eslint-disable react/no-multi-comp, no-underscore-dangle, no-named-as-default
*/

import React, { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';

import moment from 'moment';

import {
  Select,
  Checkbox,
  Button,
  Dropdown,
  Menu,
  Modal,
  DatePicker,
  message
} from 'antd';

import NavBar from './layout/NavBar';
import AppFooter from './layout/AppFooter';

import LoginRequired from './helpers/LoginRequired';
import Editor from './elements/Editor';

import { getItem, setItem, getVotingPercentage } from '../helpers/storage';
import markDown2Html from '../utils/markdown-2-html';
import formatChainError from '../utils/format-chain-error';

import {
  getDrafts,
  addDraft,
  updateDraft,
  schedule
} from '../backend/esteem-client';
import {
  revokePostingPermission,
  grantPostingPermission,
  comment
} from '../backend/steem-client';
import {
  createPermlink,
  makeOptions,
  makeJsonMetadata,
  extractMetadata
} from '../utils/posting-helpers';

import { version } from '../../package.json';

export class Preview extends Component {
  render() {
    const { title, tags, body } = this.props;
    return (
      <div className="preview-part">
        <div className="preview-part-title">
          <h2>
            <FormattedMessage id="composer.preview" />
          </h2>
        </div>

        <div className="preview-content">
          <div className="preview-content-title">{title}</div>
          <div className="preview-content-tags">
            {tags.slice(0, 5).map(t => (
              <div key={t} className="content-tag">
                {t}
              </div>
            ))}
          </div>
          <div className="preview-content-body" id="preview-content-body">
            <div className="markdown-view" dangerouslySetInnerHTML={body} />
          </div>
        </div>
      </div>
    );
  }
}

Preview.defaultProps = {
  title: '',
  tags: [],
  body: {}
};

Preview.propTypes = {
  title: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  body: PropTypes.instanceOf(Object)
};

class Compose extends Component {
  constructor(props) {
    super(props);

    const title = getItem('compose-title') || '';
    const tags = getItem('compose-tags') || [];
    const body = getItem('compose-body') || '';

    this.state = {
      title,
      tags,
      body,
      defaultValues: {
        title,
        tags,
        body
      },
      draftId: null,
      reward: 'default',
      upvote: true,
      posting: false,
      permProcessing: false,
      scheduleModalVisible: false
    };

    this.editor = React.createRef();
    this.changeTimer = null;
  }

  async componentDidMount() {
    // this.detectPostingPerm();

    this.detectDraft();
  }

  detectDraft = async () => {
    const { match, activeAccount } = this.props;
    const { path, params } = match;
    if (activeAccount && path.startsWith('/draft') && params.id) {
      let drafts;

      try {
        drafts = await getDrafts(activeAccount.username);
      } catch (err) {
        drafts = [];
      }

      drafts = drafts.filter(x => x._id === params.id);
      if (drafts.length === 1) {
        const draft = drafts[0];
        const { title, body } = draft;
        let { tags } = draft;

        try {
          tags = tags.split(' ');
        } catch (e) {
          tags = [];
        }

        this.editor.current.setState({ title, body, tags });
        this.editor.current.editorInstance.setValue(body);
        this.editor.current.changed();

        this.setState({ draftId: params.id });
      }
    }
  };

  clear = () => {
    this.editor.current.clear();

    const { draftId } = this.state;

    if (draftId) {
      const { history } = this.props;
      setTimeout(() => {
        const newLoc = `/new`;
        history.push(newLoc);
      }, 200);
    }
  };

  removePostingPerm = () => {
    this.setState({ permProcessing: true });
    const { activeAccount, global, actions, intl } = this.props;

    return revokePostingPermission(activeAccount, global.pin)
      .then(resp => {
        message.info(
          intl.formatMessage({ id: 'composer.posting-perm-removed' })
        );
        actions.updateActiveAccount();
        return resp;
      })
      .catch(err => {
        message.error(formatChainError(err));
      })
      .finally(() => {
        this.setState({ permProcessing: false });
      });
  };

  grantPostingPerm = () => {
    this.setState({ permProcessing: true });
    const { activeAccount, global, actions, intl } = this.props;
    return grantPostingPermission(activeAccount, global.pin)
      .then(resp => {
        message.success(
          intl.formatMessage({ id: 'composer.posting-perm-granted' })
        );
        actions.updateActiveAccount();
        return resp;
      })
      .catch(err => {
        message.error(formatChainError(err));
      })
      .finally(() => {
        this.setState({ permProcessing: false });
      });
  };

  editorChanged = newValues => {
    if (this.changeTimer !== null) {
      this.changeTimer = null;
      clearTimeout(this.changeTimer);
    }

    this.changeTimer = setTimeout(() => {
      setItem('compose-title', newValues.title);
      setItem('compose-tags', newValues.tags);
      setItem('compose-body', newValues.body);

      this.setState({
        title: newValues.title,
        tags: newValues.tags,
        body: newValues.body
      });

      this.changeTimer = null;
    }, 300);
  };

  saveDraft = () => {
    const { activeAccount, intl } = this.props;

    const { draftId } = this.state;
    const { title, body } = this.state;
    let { tags } = this.state;

    tags = tags.join(' ');

    let prms;

    if (draftId) {
      prms = updateDraft(activeAccount.username, draftId, title, body, tags);
    } else {
      prms = addDraft(activeAccount.username, title, body, tags).then(resp => {
        const { drafts } = resp;
        const draft = drafts.pop();

        setTimeout(() => {
          const { history } = this.props;
          const newLoc = `/draft/${draft._id}`;
          history.push(newLoc);
        }, 300);

        return resp;
      });
    }

    return prms
      .then(resp => {
        message.success(intl.formatMessage({ id: 'composer.draft-saved' }));
        return resp;
      })
      .catch(() => {
        message.error(intl.formatMessage({ id: 'g.server-error' }));
      });
  };

  schedulePost = date => {
    const { activeAccount, intl } = this.props;

    const { title, body, tags, reward, upvote } = this.state;
    const permlink = createPermlink(title);
    const meta = extractMetadata(body);
    const jsonMeta = makeJsonMetadata(meta, tags, version);

    schedule(
      activeAccount.username,
      title,
      permlink,
      jsonMeta,
      tags.join(' '),
      body,
      reward,
      upvote,
      date.toISOString()
    )
      .then(resp => {
        message.success(intl.formatMessage({ id: 'composer.schedule-saved' }));
        return resp;
      })
      .catch(() => {
        message.error(intl.formatMessage({ id: 'g.server-error' }));
      });
  };

  publish = () => {
    const { activeAccount, global, intl } = this.props;
    const { title, tags, body, reward, upvote } = this.state;

    this.setState({ posting: true });

    const parentPermlink = tags[0];
    const permlink = createPermlink(title);
    const meta = extractMetadata(body);
    const jsonMeta = makeJsonMetadata(meta, tags, version);
    const options = makeOptions(activeAccount.username, permlink, reward);
    const voteWeight = upvote
      ? getVotingPercentage(activeAccount.username) * 100
      : null;

    return comment(
      activeAccount,
      global.pin,
      '',
      parentPermlink,
      permlink,
      title,
      body,
      jsonMeta,
      options,
      voteWeight
    )
      .then(resp => {
        message.success(intl.formatMessage({ id: 'composer.published' }));
        return resp;
      })
      .catch(err => {
        message.error(formatChainError(err));
      })
      .finally(() => {
        this.setState({ posting: false });
      });
  };

  render() {
    const loading = true;

    const { intl } = this.props;

    const {
      title,
      tags,
      body,
      defaultValues,
      reward,
      upvote,
      posting,
      permProcessing,
      scheduleModalVisible
    } = this.state;

    const renderedBody = { __html: markDown2Html(body) };

    let hasPostingPerm = false;

    const { activeAccount } = this.props;
    if (activeAccount && activeAccount.accountData) {
      hasPostingPerm =
        activeAccount.accountData.posting.account_auths.filter(
          x => x[0] === 'esteemapp'
        ).length > 0;
    }

    const canPublish =
      title.trim() !== '' &&
      tags.length > 0 &&
      tags.length <= 5 &&
      body.trim() !== '';

    let scheduleMenu;
    if (hasPostingPerm) {
      scheduleMenu = (
        <Menu>
          <Menu.Item key="selectDate">
            <span
              style={{ display: 'block' }}
              role="none"
              onClick={() => {
                if (!canPublish) {
                  message.error(
                    intl.formatMessage({ id: 'composer.form-error-message' })
                  );
                  return;
                }
                this.setState({ scheduleModalVisible: true });
              }}
            >
              <FormattedMessage id="composer.select-schedule-date" />
            </span>
          </Menu.Item>
          <Menu.Item key="removePerm">
            <LoginRequired {...this.props} requiredKeys={['active']}>
              <span
                style={{ display: 'block' }}
                role="none"
                onClick={this.removePostingPerm}
              >
                {intl.formatMessage({ id: 'composer.remove-posting-perm' })}
              </span>
            </LoginRequired>
          </Menu.Item>
        </Menu>
      );
    } else {
      scheduleMenu = (
        <Menu>
          <Menu.Item key="grantPerm">
            <LoginRequired {...this.props} requiredKeys={['active']}>
              <span
                style={{ display: 'block' }}
                role="none"
                onClick={this.grantPostingPerm}
              >
                {intl.formatMessage({ id: 'composer.grant-posting-perm' })}
              </span>
            </LoginRequired>
          </Menu.Item>
        </Menu>
      );
    }

    return (
      <div className="wrapper">
        <NavBar {...this.props} reloadFn={() => {}} reloading={loading} />
        <div className="app-content compose-page">
          <Editor
            {...this.props}
            defaultValues={defaultValues}
            onChange={this.editorChanged}
            syncWith="#preview-content-body"
            mode="post"
            ref={this.editor}
            bodyPlaceHolder={intl.formatMessage({
              id: 'composer.body-placeholder'
            })}
          />
          <Preview
            {...this.props}
            title={title}
            tags={tags}
            body={renderedBody}
          />
          <div className="clearfix" />
          <div className="control-part">
            <div className="left-controls">
              <div className="reward">
                <span className="reward-label">
                  <FormattedMessage id="composer.reward" />
                </span>
                <Select
                  style={{ width: '180px' }}
                  value={reward}
                  onChange={val => {
                    this.setState({ reward: val });
                  }}
                >
                  <Select.Option key="default">
                    {intl.formatMessage({ id: 'composer.reward-default' })}
                  </Select.Option>
                  <Select.Option key="sp">
                    {intl.formatMessage({ id: 'composer.reward-sp' })}
                  </Select.Option>
                  <Select.Option key="dp">
                    {intl.formatMessage({ id: 'composer.reward-dp' })}
                  </Select.Option>
                </Select>
              </div>
              <div className="voting">
                <Checkbox
                  checked={upvote}
                  onChange={e => {
                    this.setState({
                      upvote: e.target.checked
                    });
                  }}
                >
                  <FormattedMessage id="composer.upvote" />{' '}
                </Checkbox>
              </div>
              <div className="clear">
                <Button className="clean-button" onClick={this.clear}>
                  <FormattedMessage id="composer.clear" />
                </Button>
              </div>
            </div>
            <div className="right-controls">
              <div className="schedule">
                {!activeAccount && (
                  <LoginRequired {...this.props}>
                    <Button className="clean-button">
                      <i className="mi" style={{ marginRight: '5px' }}>
                        timer
                      </i>
                      <FormattedMessage id="composer.schedule" />
                    </Button>
                  </LoginRequired>
                )}
                {activeAccount && (
                  <Dropdown
                    overlay={scheduleMenu}
                    trigger={['click']}
                    disabled={permProcessing}
                  >
                    <Button className="clean-button" loading={permProcessing}>
                      {!permProcessing && (
                        <i className="mi" style={{ marginRight: '5px' }}>
                          timer
                        </i>
                      )}{' '}
                      <FormattedMessage id="composer.schedule" />
                    </Button>
                  </Dropdown>
                )}
              </div>
              <div className="draft">
                <LoginRequired {...this.props}>
                  <Button
                    className="clean-button"
                    disabled={!canPublish}
                    onClick={this.saveDraft}
                  >
                    <i className="mi" style={{ marginRight: '5px' }}>
                      save
                    </i>{' '}
                    <FormattedMessage id="composer.save-draft" />
                  </Button>
                </LoginRequired>
              </div>
              <div className="publish">
                <LoginRequired {...this.props} requiredKeys={['posting']}>
                  <Button
                    className="btn-publish"
                    type="primary"
                    disabled={!canPublish}
                    onClick={this.publish}
                    loading={posting}
                  >
                    <FormattedMessage id="composer.publish" />
                  </Button>
                </LoginRequired>
              </div>
            </div>
          </div>
          <Modal
            visible={scheduleModalVisible}
            footer={false}
            width={280}
            title={intl.formatMessage({ id: 'composer.select-schedule-date' })}
            onCancel={() => {
              this.setState({ scheduleModalVisible: false });
            }}
          >
            {scheduleModalVisible && (
              <DatePicker
                showTime={{ format: 'HH:mm' }}
                open
                format="YYYY-MM-DD HH:mm:ss"
                defaultValue={moment()
                  .add(2, 'hours')
                  .minute(0)
                  .second(0)}
                disabledDate={current =>
                  current &&
                  current <
                    moment()
                      .subtract(1, 'day')
                      .endOf('day')
                }
                onOk={date => {
                  this.schedulePost(date.toDate());
                  this.setState({ scheduleModalVisible: false });
                }}
              />
            )}
          </Modal>
        </div>
        <AppFooter {...this.props} />
      </div>
    );
  }
}

Compose.defaultProps = {
  activeAccount: null
};

Compose.propTypes = {
  activeAccount: PropTypes.instanceOf(Object),
  intl: PropTypes.instanceOf(Object).isRequired,
  global: PropTypes.shape({
    pin: PropTypes.string
  }).isRequired,
  actions: PropTypes.shape({
    updateActiveAccount: PropTypes.func.isRequired
  }).isRequired,
  match: PropTypes.instanceOf(Object).isRequired,
  history: PropTypes.instanceOf(Object).isRequired
};

export default injectIntl(Compose);
