/*
eslint-disable react/no-multi-comp
*/

import React, { Component } from 'react';

import PropTypes from 'prop-types';
import { Modal, Button, Input } from 'antd';

import { injectIntl, FormattedMessage } from 'react-intl';

import LinearProgress from '../common/LinearProgress';
import UserAvatar from '../elements/UserAvatar';
import AccountLink from '../helpers/AccountLink';

import {
  getFollowing,
  getFollowers,
  getAccounts
} from '../../backend/steem-client';

import { searchFollowing, searchFollower } from '../../backend/esteem-client';

class Friends extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      loading: true,
      hasMore: false,
      search: ''
    };

    this.loadLimit = 80;
  }

  componentDidMount() {
    this.mounted = true;

    this.loadFirst();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  stateSet = (obj, cb = undefined) => {
    if (this.mounted) {
      this.setState(obj, cb);
    }
  };

  loadFirst = async () => {
    this.stateSet({ loading: true, data: [], hasMore: false });
    let data;
    try {
      data = await this.loadData();
    } catch (e) {
      data = [];
    }

    this.stateSet({
      data,
      hasMore: data.length >= this.loadLimit,
      loading: false
    });
  };

  loadMore = async () => {
    const { data } = this.state;
    const lastItem = [...data].pop();
    const startUserName = lastItem.name;

    this.stateSet({ loading: true });
    let moreData;

    try {
      moreData = await this.loadData(startUserName);
    } catch (e) {
      moreData = [];
    }

    const newData = [
      ...data,
      ...moreData.filter(a => !data.find(b => b.name === a.name))
    ];

    this.stateSet({
      data: newData,
      hasMore: moreData.length >= this.loadLimit,
      loading: false
    });
  };

  searchChanged = e => {
    const { loading } = this.state;
    if (loading) {
      return;
    }

    const val = e.target.value.trim();
    this.stateSet({ search: val });
  };

  onSearch = async () => {
    const { search } = this.state;
    const { username, mode } = this.props;

    if (!search) {
      return this.loadFirst();
    }

    this.stateSet({ loading: true, data: [], hasMore: false });

    const searchFn = mode === 'following' ? searchFollowing : searchFollower;

    let data;
    try {
      data = await searchFn(username, search);
    } catch (e) {
      data = [];
    }

    this.stateSet({
      data,
      hasMore: false,
      loading: false
    });
  };

  kKey = () => {
    const { mode } = this.props;

    return mode === 'following' ? 'following' : 'follower';
  };

  loadData = async (start = undefined, limit = this.loadLimit) => {
    const { username, mode } = this.props;

    const loadFn = mode === 'following' ? getFollowing : getFollowers;

    return loadFn(username, start, 'blog', limit)
      .then(resp => {
        const accountNames = resp.map(e => e[this.kKey()]);
        return getAccounts(accountNames).then(resp2 => resp2);
      })
      .then(accounts => accounts.map(a => this.prepareAccountData(a)));
  };

  prepareAccountData = data => {
    let name;

    if (data.json_metadata !== undefined && data.json_metadata !== '') {
      try {
        const { profile } = JSON.parse(data.json_metadata);
        ({ name } = profile);
      } catch (e) {
        name = '';
      }
    }

    return Object.assign({}, data, { full_name: name });
  };

  render() {
    const { intl, afterClick } = this.props;
    const { loading, data, hasMore, search } = this.state;

    return (
      <div className="friends-dialog-content">
        {loading && <LinearProgress />}

        <div className="friends-list">
          <div className="friend-search-box">
            <Input.Search
              value={search}
              disabled={loading}
              placeholder={intl.formatMessage({
                id: 'friends.search-placeholder'
              })}
              onChange={this.searchChanged}
              onSearch={this.onSearch}
            />
          </div>

          <div className="friends-list-body">
            {!loading && data.length === 0 && (
              <div className="empty-list">Nothing here</div>
            )}

            {data.map(item => (
              <AccountLink
                {...this.props}
                username={item.name}
                key={item.name}
                onClick={afterClick}
              >
                <div className="friends-list-item">
                  <UserAvatar user={item.name} size="large" />
                  <div className="friend-name">{item.name}</div>
                  <div className="friend-full-name">{item.full_name}</div>
                </div>
              </AccountLink>
            ))}
          </div>

          {data.length > 1 && !search && (
            <div className="load-more">
              <Button
                type="primary"
                loading={loading}
                disabled={loading || !hasMore}
                onClick={this.loadMore}
              >
                <FormattedMessage id="friends.load-more" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
}

Friends.defaultProps = {};

Friends.propTypes = {
  mode: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  afterClick: PropTypes.func.isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

class FriendsModal extends Component {
  render() {
    const { visible, onCancel, intl, mode, count } = this.props;

    let modalTitleId = 'friends.followers-title';
    if (mode === 'following') {
      modalTitleId = 'friends.following-title';
    }

    return (
      <Modal
        visible={visible}
        footer={false}
        width="890px"
        onCancel={onCancel}
        destroyOnClose
        centered
        title={intl.formatMessage(
          { id: modalTitleId },
          { count: intl.formatNumber(count) }
        )}
      >
        <Friends {...this.props} afterClick={onCancel} />
      </Modal>
    );
  }
}

FriendsModal.defaultProps = {
  onSelect: null,
  count: 0
};

FriendsModal.propTypes = {
  count: PropTypes.number,
  username: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
  onSelect: PropTypes.func,
  onCancel: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default injectIntl(FriendsModal);
