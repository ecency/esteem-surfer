/*
eslint-disable import/no-cycle
*/

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Drawer, message } from 'antd';
import { FormattedMessage, FormattedNumber, injectIntl } from 'react-intl';

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

class QuickProfile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      active: false,
      profile: {
        name: ' ',
        about: ' ',
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

      this.setState({ profile: { name, about, postCount } });
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

  render() {
    const { children, username } = this.props;
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
        <FormattedNumber value={follows.followerCount}/>
      );
    const postCountMsg =
      profile.postCount === null ? (
        '--'
      ) : (
        <FormattedNumber value={profile.postCount}/>
      );
    const followingMsg =
      follows.followingCount === null ? (
        '--'
      ) : (
        <FormattedNumber value={follows.followingCount}/>
      );

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
                <div className="follow-btn-holder">
                  <FollowControls {...this.props} targetUsername={username}/>
                </div>
                <div className="profile-avatar">
                  <UserAvatar user={username} size="large"/>
                  <div className="reputation">
                    {authorReputation(reputation)}
                  </div>
                </div>
                {profile.name && (
                  <div className="full-name">{profile.name}</div>
                )}
                <AccountLink
                  {...this.props}
                  username={username}
                  accountData={accountData}
                >
                  <div className="username">{username}</div>
                </AccountLink>
                {profile.about && <div className="about">{profile.about}</div>}
                <div className="numbers">
                  <span className="followers">
                    <FormattedMessage
                      id="quick-profile.n-followers"
                      values={{ n: followersMsg }}
                    />
                  </span>
                  <span className="post-count">
                    <FormattedMessage
                      id="quick-profile.n-posts"
                      values={{ n: postCountMsg }}
                    />
                  </span>
                  <span className="following">
                    <FormattedMessage
                      id="quick-profile.n-following"
                      values={{ n: followingMsg }}
                    />
                  </span>
                </div>
              </div>

              {loadingEntries && (
                <Fragment>
                  <LinearProgress/>
                  <div className="entries">
                    <EntryListLoadingItem/>
                  </div>
                </Fragment>
              )}

              {!loadingEntries && (
                <div className="entries">
                  {entries.map(d => (
                    <EntryListItem
                      key={d.id}
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
  history: PropTypes.instanceOf(Object).isRequired
};

export default injectIntl(QuickProfile);
