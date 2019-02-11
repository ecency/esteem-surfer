/*
eslint-disable react/no-multi-comp
*/

import React, { Component } from 'react';

import PropTypes from 'prop-types';
import { Modal, Button } from 'antd';

import { injectIntl } from 'react-intl';

import LinearProgress from '../common/LinearProgress';
import UserAvatar from '../elements/UserAvatar';
import AccountLink from '../helpers/AccountLink';

import {
  getFollowing,
  getFollowers,
  getAccounts
} from '../../backend/steem-client';

class Friends extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      loading: true,
      hasMore: false
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
    this.stateSet({ loading: true });
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
      ...moreData.filter(a => a.name !== startUserName)
    ];

    this.stateSet({
      data: newData,
      hasMore: moreData.length >= this.loadLimit,
      loading: false
    });
  };

  loadFn = () => {
    const { mode } = this.props;

    return mode === 'following' ? getFollowing : getFollowers;
  };

  kKey = () => {
    const { mode } = this.props;

    return mode === 'following' ? 'following' : 'follower';
  };

  loadData = async (start = undefined) => {
    const { username } = this.props;

    return this.loadFn()(username, start, 'blog', this.loadLimit)
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
    const { loading, data, hasMore } = this.state;

    return (
      <div className="friends-dialog-content">
        {loading && <LinearProgress />}

        <div className="friends-list">
          <div className="friends-list-body">
            {data.map(item => (
              <AccountLink {...this.props} username={item.name} key={item.name}>
                <div className="friends-list-item">
                  <UserAvatar user={item.name} size="large" />
                  <div className="friend-name">{item.name}</div>
                  <div className="friend-full-name">{item.full_name}</div>
                </div>
              </AccountLink>
            ))}
          </div>

          {data.length > 0 && (
            <div className="load-more">
              <Button
                type="primary"
                loading={loading}
                disabled={loading || !hasMore}
                onClick={this.loadMore}
              >
                Load More
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
        <Friends {...this.props} />
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
