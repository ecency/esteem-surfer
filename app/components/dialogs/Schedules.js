/*
eslint-disable react/no-multi-comp, no-underscore-dangle
*/

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { message, Modal, Popconfirm } from 'antd';
import { FormattedMessage, FormattedDate } from 'react-intl';

import moment from 'moment';

import {
  catchPostImage,
  postBodySummary
} from '@esteemapp/esteem-render-helpers';

import Tooltip from '../common/Tooltip';

import LinearProgress from '../common/LinearProgress';
import UserAvatar from '../elements/UserAvatar';

import authorReputation from '../../utils/author-reputation';

import fallbackImage from '../../img/fallback.png';
import noImage from '../../img/noimage.png';

import {
  getSchedules,
  removeSchedule,
  moveSchedule
} from '../../backend/esteem-client';

class ScheduleListItem extends Component {
  delete = item => {
    const { activeAccount, onDelete, intl } = this.props;
    removeSchedule(item._id, activeAccount.username)
      .then(resp => {
        message.info(intl.formatMessage({ id: 'schedules.deleted' }));
        onDelete(item);
        return resp;
      })
      .catch(() => {
        message.error(intl.formatMessage({ id: 'g.server-error' }));
      });
  };

  move = item => {
    const { activeAccount, onDelete, intl } = this.props;
    moveSchedule(item._id, activeAccount.username)
      .then(resp => {
        message.info(intl.formatMessage({ id: 'schedules.moved' }));
        onDelete(item);
        return resp;
      })
      .catch(() => {
        message.error(intl.formatMessage({ id: 'g.server-error' }));
      });
  };

  render() {
    const { author, reputation, item, intl } = this.props;
    const tags = item.tags ? item.tags.split(/,| /) : [];
    const tag = tags[0] || '';
    const img = catchPostImage(item.body) || noImage;
    const summary = postBodySummary(item.body, 200);

    const itemDate = moment(item.schedule).toDate();
    const compareDate = moment()
      .add(60, 'seconds')
      .toDate();

    const publishSuccess = compareDate > itemDate && item.published;
    const publishError = compareDate > itemDate && !item.published;

    return (
      <div className="schedules-list-item">
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
          <a className="category">{tag}</a>
          <span className="date">
            <FormattedDate
              value={item.schedule}
              year="numeric"
              month="numeric"
              day="numeric"
              hour="numeric"
              minute="numeric"
            />
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
              title={intl.formatMessage({ id: 'schedules.move' })}
              mouseEnterDelay={2}
            >
              <span
                className="btn-edit"
                role="none"
                onClick={() => {
                  this.move(item);
                }}
              >
                <i className="mi">insert_drive_file</i>
              </span>
            </Tooltip>

            <div className="item-status">
              {publishSuccess && (
                <Tooltip
                  title={intl.formatMessage({
                    id: 'schedules.success-message'
                  })}
                >
                  <span className="status-success">
                    <i className="mi">done_all</i>
                  </span>
                </Tooltip>
              )}
              {publishError && (
                <Tooltip
                  title={intl.formatMessage({ id: 'schedules.error-message' })}
                >
                  <span className="status-error">
                    <i className="mi">error</i>
                  </span>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ScheduleListItem.defaultProps = {
  reputation: null
};

ScheduleListItem.propTypes = {
  activeAccount: PropTypes.instanceOf(Object).isRequired,
  onDelete: PropTypes.func.isRequired,
  author: PropTypes.string.isRequired,
  reputation: PropTypes.number,
  item: PropTypes.instanceOf(Object).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

class Schedules extends Component {
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

    return getSchedules(activeAccount.username)
      .then(data => {
        this.setState({ data: this.sortData(data) });
        return data;
      })
      .catch(() => {
        message.error(intl.formatMessage({ id: 'g.server-error' }));
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  sortData = data =>
    data.sort((a, b) => {
      const dateA = new Date(a.schedule).getTime();
      const dateB = new Date(b.schedule).getTime();

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
      <div className="schedules-dialog-content">
        {loading && <LinearProgress />}
        {data.length > 0 && (
          <div className="schedules-list">
            <div className="schedules-list-body">
              {data.map(item => (
                <ScheduleListItem
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
          <div className="schedules-list">
            <FormattedMessage id="schedules.empty-list" />
          </div>
        )}
      </div>
    );
  }
}

Schedules.propTypes = {
  activeAccount: PropTypes.instanceOf(Object).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

class SchedulesModal extends Component {
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
        title={intl.formatMessage({ id: 'schedules.title' })}
      >
        <Schedules {...this.props} />
      </Modal>
    );
  }
}

SchedulesModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default SchedulesModal;
