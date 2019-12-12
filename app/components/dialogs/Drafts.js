/*
eslint-disable react/no-multi-comp, no-underscore-dangle
*/

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { message, Modal, Popconfirm } from 'antd';
import { FormattedMessage, injectIntl, FormattedRelative } from 'react-intl';

import {
  catchPostImage,
  postBodySummary
} from '@esteemapp/esteem-render-helpers';

import Tooltip from '../common/Tooltip';

import LinearProgress from '../common/LinearProgress';
import UserAvatar from '../elements/UserAvatar';

import authorReputation from '../../utils/author-reputation';

import { getDrafts, removeDraft } from '../../backend/esteem-client';

import fallbackImage from '../../img/fallback.png';
import noImage from '../../img/noimage.png';

class DraftListItem extends Component {
  delete = item => {
    const { activeAccount, intl, onDelete } = this.props;
    removeDraft(item._id, activeAccount.username)
      .then(resp => {
        message.info(intl.formatMessage({ id: 'drafts.deleted' }));
        onDelete(item);
        return resp;
      })
      .catch(() => {});
  };

  edit = item => {
    const { history } = this.props;
    const newLoc = `/draft/${item._id}`;
    history.push(newLoc);
  };

  render() {
    const { author, reputation, item, intl } = this.props;
    const tags = item.tags ? item.tags.split(/[ ,]+/) : [];
    const tag = tags[0] || '';
    const img = catchPostImage(item.body) || noImage;
    const summary = postBodySummary(item.body, 200);

    return (
      <div className="drafts-list-item">
        <div className="item-header">
          <div className="author-part">
            <div className="author-avatar">
              <UserAvatar {...this.props} user={author} size="small" />
            </div>
            <div className="author">
              {author}{' '}
              {reputation && (
                <span className="author-reputation">{reputation}</span>
              )}
            </div>
          </div>
          {tag && <a className="category">{tag}</a>}
          <span className="date">
            <FormattedRelative value={item.created} initialNow={Date.now()} />
          </span>
        </div>
        <div className="item-body">
          <div className="item-image">
            <img
              src={img}
              alt=""
              onError={e => {
                e.target.src = fallbackImage;
              }}
            />
          </div>
          <div className="item-summary">
            <div className="item-title">{item.title}</div>
            <div className="item-body">{summary}</div>
          </div>
          <div className="item-controls">
            <Popconfirm
              title={intl.formatMessage({ id: 'g.are-you-sure' })}
              okText={intl.formatMessage({ id: 'g.ok' })}
              cancelText={intl.formatMessage({ id: 'g.cancel' })}
              onConfirm={() => {
                this.delete(item);
              }}
            >
              <Tooltip
                title={intl.formatMessage({ id: 'g.delete' })}
                mouseEnterDelay={2}
              >
                <span className="btn-delete">
                  <i className="mi">delete_forever</i>
                </span>
              </Tooltip>
            </Popconfirm>
            <Tooltip
              title={intl.formatMessage({ id: 'g.edit' })}
              mouseEnterDelay={2}
            >
              <span
                className="btn-edit"
                role="none"
                onClick={() => {
                  this.edit(item);
                }}
              >
                <i className="mi">edit</i>
              </span>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  }
}

DraftListItem.defaultProps = {
  reputation: null
};

DraftListItem.propTypes = {
  activeAccount: PropTypes.instanceOf(Object).isRequired,
  onDelete: PropTypes.func.isRequired,
  author: PropTypes.string.isRequired,
  reputation: PropTypes.number,
  item: PropTypes.instanceOf(Object).isRequired,
  history: PropTypes.instanceOf(Object).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

class Drafts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      loading: true
    };
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    this.setState({ data: [], loading: true });

    const { activeAccount, intl } = this.props;

    return getDrafts(activeAccount.username)
      .then(data => {
        this.setState({ data: this.sortData(data) });
        return data;
      })
      .catch(() => {
        message.error(intl.formatMessage({ id: 'drafts.load-error' }));
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  sortData = data =>
    data.sort((a, b) => {
      const dateA = new Date(a.created).getTime();
      const dateB = new Date(b.created).getTime();

      return dateB > dateA ? 1 : -1;
    });

  onDelete = item => {
    const { data } = this.state;
    const newData = [...data].filter(x => x._id !== item._id);
    this.setState({ data: this.sortData(newData) });
  };

  render() {
    const { activeAccount } = this.props;
    const { data, loading } = this.state;

    const { username: author } = activeAccount;
    const { accountData } = activeAccount;
    const reputation = accountData
      ? authorReputation(accountData.reputation)
      : null;

    return (
      <div className="drafts-dialog-content">
        {loading && <LinearProgress />}
        {data.length > 0 && (
          <div className="drafts-list">
            <div className="drafts-list-body">
              {data.map(item => (
                <DraftListItem
                  {...this.props}
                  onDelete={this.onDelete}
                  author={author}
                  reputation={reputation}
                  item={item}
                  key={item._id}
                />
              ))}
            </div>
          </div>
        )}
        {!loading && data.length < 1 && (
          <div className="drafts-list">
            <FormattedMessage id="drafts.empty-list" />
          </div>
        )}
      </div>
    );
  }
}

Drafts.defaultProps = {
  onSelect: null
};

Drafts.propTypes = {
  onSelect: PropTypes.func,
  activeAccount: PropTypes.instanceOf(Object).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

class DraftsModal extends Component {
  render() {
    const { visible, onCancel, intl } = this.props;

    return (
      <Modal
        visible={visible}
        footer={false}
        width="890px"
        onCancel={onCancel}
        destroyOnClose
        centered
        title={intl.formatMessage({ id: 'drafts.title' })}
      >
        <Drafts {...this.props} />
      </Modal>
    );
  }
}

DraftsModal.defaultProps = {
  onSelect: null
};

DraftsModal.propTypes = {
  onSelect: PropTypes.func,
  onCancel: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default injectIntl(DraftsModal);
