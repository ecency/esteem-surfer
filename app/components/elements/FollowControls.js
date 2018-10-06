import React, { Component, Fragment } from 'react';

import PropTypes from 'prop-types';

import { Button, message } from 'antd';
import { FormattedMessage } from 'react-intl';

import LoginRequired from '../helpers/LoginRequired';
import {
  getFollowing,
  follow,
  unFollow,
  ignore
} from '../../backend/steem-client';

import formatChainError from '../../utils/format-chain-error';

class FollowControls extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fetching: true,
      processing: false,
      following: false,
      muted: false
    };
  }

  async componentDidMount() {
    const { activeAccount } = this.props;

    if (!activeAccount) {
      this.setState({ fetching: false });
      return;
    }

    await this.fetchStatus();

    this.setState({ fetching: false });
  }

  isFollowing = async () => {
    const { activeAccount, targetUsername } = this.props;
    const { username } = activeAccount;

    let resp;
    try {
      resp = await getFollowing(username, targetUsername, 'blog', 1);
    } catch (err) {
      return false;
    }

    if (resp && resp.length > 0) {
      if (
        resp[0].follower === username &&
        resp[0].following === targetUsername
      ) {
        return true;
      }
    }

    return false;
  };

  isMuted = async () => {
    const { activeAccount, targetUsername } = this.props;
    const { username } = activeAccount;

    let resp;
    try {
      resp = await getFollowing(username, targetUsername, 'ignore', 1);
    } catch (err) {
      return false;
    }

    if (resp && resp.length > 0) {
      if (
        resp[0].follower === username &&
        resp[0].following === targetUsername
      ) {
        return true;
      }
    }

    return false;
  };

  fetchStatus = async () => {
    const following = await this.isFollowing();

    // No need to check if muted when already following
    const muted = following ? false : await this.isMuted();

    this.setState({ following, muted });
  };

  follow = async () => {
    const { activeAccount, targetUsername, global } = this.props;
    const { pin } = global;

    this.setState({ processing: true });
    try {
      await follow(activeAccount, pin, targetUsername);
    } catch (err) {
      message.error(formatChainError(err));
    } finally {
      await this.fetchStatus();
      this.setState({ processing: false });
    }
  };

  unFollow = async () => {
    const { activeAccount, targetUsername, global } = this.props;
    const { pin } = global;

    this.setState({ processing: true });
    try {
      await unFollow(activeAccount, pin, targetUsername);
    } catch (err) {
      message.error(formatChainError(err));
    } finally {
      await this.fetchStatus();
      this.setState({ processing: false });
    }
  };

  mute = async () => {
    const { activeAccount, targetUsername, global } = this.props;
    const { pin } = global;

    this.setState({ processing: true });
    try {
      await ignore(activeAccount, pin, targetUsername);
    } catch (err) {
      message.error(formatChainError(err));
    } finally {
      await this.fetchStatus();
      this.setState({ processing: false });
    }
  };

  render() {
    const { following, muted, fetching, processing } = this.state;

    const followMsg = <FormattedMessage id="follow-controls.follow" />;
    const unFollowMsg = <FormattedMessage id="follow-controls.unFollow" />;
    const muteMsg = <FormattedMessage id="follow-controls.mute" />;
    const unMuteMsg = <FormattedMessage id="follow-controls.unMute" />;

    const btnFollow = (
      <LoginRequired {...this.props} requiredKeys={['posting']}>
        <Button
          type="primary"
          style={{ marginRight: '5px' }}
          disabled={processing}
          onClick={this.follow}
        >
          {followMsg}
        </Button>
      </LoginRequired>
    );

    const btnUnfollow = (
      <LoginRequired {...this.props} requiredKeys={['posting']}>
        <Button
          type="primary"
          style={{ marginRight: '5px' }}
          disabled={processing}
          onClick={this.unFollow}
        >
          {unFollowMsg}
        </Button>
      </LoginRequired>
    );

    const btnMute = (
      <LoginRequired {...this.props} requiredKeys={['posting']}>
        <Button disabled={processing} onClick={this.mute}>
          {muteMsg}
        </Button>
      </LoginRequired>
    );

    const btnUnMute = (
      <LoginRequired {...this.props} requiredKeys={['posting']}>
        <Button disabled={processing} onClick={this.unFollow}>
          {unMuteMsg}
        </Button>
      </LoginRequired>
    );

    if (fetching) {
      return (
        <Fragment>
          <Button type="primary" disabled style={{ marginRight: '5px' }}>
            {followMsg}
          </Button>
          <Button disabled>{muteMsg}</Button>
        </Fragment>
      );
    }

    if (following) {
      return (
        <Fragment>
          {btnUnfollow}
          {btnMute}
        </Fragment>
      );
    }

    if (muted) {
      return (
        <Fragment>
          {btnFollow}
          {btnUnMute}
        </Fragment>
      );
    }

    return (
      <Fragment>
        {btnFollow}
        {btnMute}
      </Fragment>
    );
  }
}

FollowControls.defaultProps = {
  activeAccount: null
};

FollowControls.propTypes = {
  global: PropTypes.shape({
    pin: PropTypes.string
  }).isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  targetUsername: PropTypes.string.isRequired
};

export default FollowControls;
