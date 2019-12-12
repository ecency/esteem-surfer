/*
eslint-disable import/no-cycle
*/

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Drawer, message } from 'antd';
import { FormattedMessage, FormattedNumber, injectIntl } from 'react-intl';

import { proxifyImageSrc } from '@esteemapp/esteem-render-helpers';

import Tooltip from '../common/Tooltip';

import {
  getAccount,
  getDiscussions,
  getFollowCount
} from '../../backend/steem-client';
import authorReputation from '../../utils/author-reputation';

import UserAvatar from '../elements/UserAvatar';
import EntryListLoadingItem from '../elements/EntryListLoadingItem';
import LinearProgress from '../common/LinearProgress';
import EntryListItem from '../elements/EntryListItem';
import FollowControls from '../elements/FollowControls';
import AccountLink from './AccountLink';
import coverFallbackDay from '../../img/cover-fallback-day.png';
import coverFallbackNight from '../../img/cover-fallback-night.png';

class QuickProfile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      active: false,
      profile: {
        name: ' ',
        about: ' ',
        coverImage: null,
        postCount: 0
      },
      follows: {
        followerCount: null,
        followingCount: null
      },
      loadingEntries: true,
      entries: [],
      accountData: null
    };
  }

  load = async () => {
    const { username, intl } = this.props;

    const account = await getAccount(username);

    this.setState({ accountData: account });

    let accountProfile;
    try {
      accountProfile = JSON.parse(account.json_metadata).profile;
    } catch (err) {
      accountProfile = {};
    }

    if (accountProfile) {
      const name = accountProfile.name || null;
      const about = accountProfile.about || null;
      const postCount = account.post_count;
      const coverImage = accountProfile.cover_image || null;

      this.setState({ profile: { name, about, coverImage, postCount } });
    }

    let follow;
    try {
      follow = await getFollowCount(username);
    } catch (err) {
      message.error(
        intl.formatMessage({ id: 'quick-profile.fetch-error-profile' })
      );
    }

    if (follow) {
      const followerCount = follow.follower_count;
      const followingCount = follow.following_count;

      this.setState({ follows: { followerCount, followingCount } });
    }

    let entries;
    try {
      entries = await getDiscussions('blog', {
        tag: username,
        limit: 7,
        start_author: undefined,
        start_permlink: undefined
      });
    } catch (err) {
      message.error(
        intl.formatMessage({ id: 'quick-profile.fetch-error-content' })
      );
    }

    if (entries) {
      this.setState({ entries, loadingEntries: false });
    }
  };

  show = () => {
    this.setState({ active: true, visible: true });
    this.load();
  };

  hide = () => {
    this.setState({ visible: false });
    setTimeout(() => {
      this.setState({ active: false });
    }, 500);
  };

  goSection = section => {
    const { history, username } = this.props;
    const u = `/@${username}/${section}`;
    history.push(u);
  };

  render() {
    const { children, username, global, intl } = this.props;
    let { reputation } = this.props;
    const {
      visible,
      active,
      profile,
      follows,
      entries,
      loadingEntries,
      accountData
    } = this.state;

    if (accountData) ({ reputation } = accountData);

    const newChild = React.cloneElement(children, {
      onClick: () => {
        this.show();
      }
    });

    const followersMsg =
      follows.followerCount === null ? (
        '--'
      ) : (
        <FormattedNumber value={follows.followerCount} />
      );
    const postCountMsg =
      profile.postCount === null ? (
        '--'
      ) : (
        <FormattedNumber value={profile.postCount} />
      );
    const followingMsg =
      follows.followingCount === null ? (
        '--'
      ) : (
        <FormattedNumber value={follows.followingCount} />
      );

    const bgImage =
      (profile.coverImage && proxifyImageSrc(profile.coverImage)) ||
      (global.theme === 'day' ? coverFallbackDay : coverFallbackNight);

    return (
      <Fragment>
        {newChild}

        {active && (
          <Drawer
            placement="right"
            closable={false}
            onClose={this.hide}
            visible={visible}
            width="640px"
          >
            <div
              className={`quick-profile-content ${
                loadingEntries ? 'loading' : ''
              } `}
            >
              <div className="profile-area">
                <div
                  className="account-cover"
                  style={{ backgroundImage: `url('${bgImage}')` }}
                >
                  <div className="profile-avatar">
                    <UserAvatar {...this.props} user={username} size="large" />
                    <div className="reputation">
                      {authorReputation(reputation)}
                    </div>
                  </div>
                  <div className="follow-btn-holder">
                    <FollowControls {...this.props} targetUsername={username} />
                  </div>
                </div>
                <AccountLink
                  {...this.props}
                  username={username}
                  accountData={accountData}
                >
                  <div className="username">{username}</div>
                </AccountLink>
                <div className="about">{profile.about}</div>
                <div className="numbers">
                  <Tooltip
                    title={intl.formatMessage({
                      id: 'quick-profile.post-count'
                    })}
                  >
                    <span className="post-count">
                      <i className="mi">list</i>
                      {postCountMsg}
                    </span>
                  </Tooltip>
                  <Tooltip
                    title={intl.formatMessage({
                      id: 'quick-profile.followers'
                    })}
                  >
                    <span className="followers">
                      <i className="mi">people</i>
                      {followersMsg}
                    </span>
                  </Tooltip>
                  <Tooltip
                    title={intl.formatMessage({
                      id: 'quick-profile.following'
                    })}
                  >
                    <span className="following">
                      <i className="mi">person_add</i>
                      {followingMsg}
                    </span>
                  </Tooltip>
                </div>
              </div>

              <div className="account-menu">
                <div className="account-menu-items">
                  <a
                    role="none"
                    className="menu-item selected-item"
                    onClick={() => {
                      this.goSection('blog');
                    }}
                  >
                    <FormattedMessage id="quick-profile.section-blog" />
                  </a>
                  <a
                    role="none"
                    className="menu-item"
                    onClick={() => {
                      this.goSection('comments');
                    }}
                  >
                    <FormattedMessage id="quick-profile.section-comments" />
                  </a>
                  <a
                    role="none"
                    className="menu-item"
                    onClick={() => {
                      this.goSection('replies');
                    }}
                  >
                    <FormattedMessage id="quick-profile.section-replies" />
                  </a>
                  <span className="separator-item" />
                  <a
                    role="none"
                    className="menu-item"
                    onClick={() => {
                      this.goSection('points');
                    }}
                  >
                    <FormattedMessage id="quick-profile.section-points" />
                  </a>
                  <a
                    role="none"
                    className="menu-item"
                    onClick={() => {
                      this.goSection('wallet');
                    }}
                  >
                    <FormattedMessage id="quick-profile.section-wallet" />
                  </a>
                </div>
              </div>

              {loadingEntries && (
                <Fragment>
                  <LinearProgress />
                  <div className="entries">
                    <EntryListLoadingItem />
                  </div>
                </Fragment>
              )}

              {!loadingEntries && (
                <div className="entries">
                  {entries.map(d => (
                    <EntryListItem
                      key={`${d.author}-${d.permlink}`}
                      {...this.props}
                      entry={d}
                      asAuthor={username}
                      inDrawer
                    />
                  ))}
                </div>
              )}
            </div>
          </Drawer>
        )}
      </Fragment>
    );
  }
}

QuickProfile.defaultProps = {};

QuickProfile.propTypes = {
  children: PropTypes.element.isRequired,
  username: PropTypes.string.isRequired,
  reputation: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  history: PropTypes.instanceOf(Object).isRequired,
  global: PropTypes.shape({
    theme: PropTypes.string.isRequired
  }).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default injectIntl(QuickProfile);
