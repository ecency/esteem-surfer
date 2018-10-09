import React, { Component } from 'react';

import PropTypes from 'prop-types';

import { Tooltip } from 'antd';

import { FormattedNumber, FormattedDate } from 'react-intl';

import NavBar from './layout/NavBar';

import ComposeBtn from './elements/ComposeBtn';
import UserAvatar from './elements/UserAvatar';

import { getFollowCount, getAccount } from '../backend/steem-client';

import { getActiveVotes } from '../backend/esteem-client';

import authorReputation from '../utils/author-reputation';
import { votingPower } from '../utils/manabar';

class Account extends Component {
  constructor(props) {
    super(props);

    const { match } = this.props;
    const { username } = match.params;

    this.state = {
      username,
      account: null
    };
  }

  componentDidMount() {
    this.load();
  }

  load = async () => {
    const { username } = this.state;

    let { visitingAccount: account } = this.props;

    if (account && account.name === username) {
      account = await getAccount(username);
    }

    // Profile data
    let accountProfile;
    try {
      accountProfile = JSON.parse(account.json_metadata).profile;
    } catch (err) {
      accountProfile = null;
    }

    account = Object.assign({}, account, { accountProfile });
    this.setState({ account });

    // Follow counts
    let follow;
    try {
      follow = await getFollowCount(username);
    } catch (err) {
      follow = null;
    }

    if (follow) {
      const followerCount = follow.follower_count;
      const followingCount = follow.following_count;

      account = Object.assign({}, account, { followerCount, followingCount });
      this.setState({ account });
    }

    // Active votes
    let activeVotes;
    try {
      activeVotes = await getActiveVotes(username);

      console.log(activeVotes);
    } catch (err) {
      activeVotes = null;
    }

    if (activeVotes) {
      account = Object.assign({}, account, { activeVotes: activeVotes.count });
      this.setState({ account });
    }
  };

  refresh = () => {};

  render() {
    const { username } = this.state;

    let vPower;
    let vPowerPercentage;
    let reputation;
    let name;
    let about;
    let postCount;
    let activeVotes;
    let followerCount;
    let followingCount;

    let location;
    let website;
    let created;

    const { account } = this.state;

    if (account) {
      vPower = votingPower(account);
      vPowerPercentage = `${parseInt(vPower, 10)}%`;
      reputation = authorReputation(account.reputation);
      postCount = account.post_count;

      activeVotes = account.activeVotes || null;
      followerCount = account.followerCount || null;
      followingCount = account.followingCount || null;

      const { accountProfile } = account;
      if (accountProfile) {
        name = accountProfile.name || null;
        about = accountProfile.about || null;
        location = accountProfile.location || null;
        website = accountProfile.website || null;
      }

      created = new Date(account.created);
      console.log(created);
    }

    const loading = false;

    return (
      <div className="wrapper">
        <NavBar
          {...this.props}
          reloadFn={() => {
            this.refresh();
          }}
          reloading={loading}
        />

        <div className="app-content account-page">
          <div className="page-header">
            <div className="left-side">
              <ComposeBtn {...this.props} />
            </div>
          </div>

          <div className="page-inner" id="app-content">
            <div className="left-side">
              <div className="profile-area">
                <div className="account-avatar">
                  <UserAvatar user={username} size="xLarge" />
                  {reputation && <div className="reputation">{reputation}</div>}
                </div>

                <div className="username-n-vpower-percentage">
                  <div className="username">{username}</div>
                  {vPower && (
                    <div className="vpower-percentage">{vPower.toFixed(2)}</div>
                  )}
                </div>

                {vPowerPercentage && (
                  <div className="vpower-line">
                    <Tooltip title="Voting Power">
                      <div
                        className="vpower-line-inner"
                        style={{ width: vPowerPercentage }}
                      />
                    </Tooltip>
                  </div>
                )}

                {name && <div className="full-name">{name}</div>}

                {about && <div className="about">{about}</div>}

                {(name || about) && <div className="divider" />}

                <div className="account-numbers">
                  {postCount !== null && (
                    <div className="account-prop">
                      <Tooltip title="Post Count" className="holder-tooltip">
                        <i className="mi">list</i>{' '}
                        <FormattedNumber value={postCount} />
                      </Tooltip>
                    </div>
                  )}

                  {activeVotes !== null && (
                    <div className="account-prop">
                      <Tooltip
                        title="Number of votes in last 24 hours"
                        className="holder-tooltip"
                      >
                        <i className="mi active-votes-icon">
                          keyboard_arrow_up
                        </i>{' '}
                        <FormattedNumber value={activeVotes} />
                      </Tooltip>
                    </div>
                  )}

                  {followerCount !== null && (
                    <div className="account-prop">
                      <Tooltip title="Followers" className="holder-tooltip">
                        <i className="mi">people</i>{' '}
                        <FormattedNumber value={followerCount} />
                      </Tooltip>
                    </div>
                  )}

                  {followingCount !== null && (
                    <div className="account-prop">
                      <Tooltip title="Following" className="holder-tooltip">
                        <i className="mi">person_add</i>{' '}
                        <FormattedNumber value={followingCount} />
                      </Tooltip>
                    </div>
                  )}
                </div>

                <div className="divider" />

                {location && (
                  <div className="account-prop">
                    <i className="mi">near_me</i> {location}
                  </div>
                )}

                {website && (
                  <div className="account-prop prop-website">
                    <i className="mi">public</i>{' '}
                    <a className="website-link">{website}</a>
                  </div>
                )}

                {created && (
                  <div className="account-prop">
                    <i className="mi">date_range</i>{' '}
                    <FormattedDate
                      month="long"
                      day="2-digit"
                      year="numeric"
                      value={created}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Account.defaultProps = {
  visitingAccount: null
};

Account.propTypes = {
  actions: PropTypes.shape({
    fetchEntries: PropTypes.func.isRequired,
    invalidateEntries: PropTypes.func.isRequired,
    changeTheme: PropTypes.func.isRequired,
    changeListStyle: PropTypes.func.isRequired
  }).isRequired,
  global: PropTypes.shape({
    listStyle: PropTypes.string.isRequired
  }).isRequired,
  entries: PropTypes.instanceOf(Object).isRequired,
  location: PropTypes.instanceOf(Object).isRequired,
  history: PropTypes.instanceOf(Object).isRequired,
  match: PropTypes.instanceOf(Object).isRequired,
  visitingAccount: PropTypes.instanceOf(Object)
};

export default Account;
