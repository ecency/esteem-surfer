/*
eslint-disable react/no-multi-comp
*/


import React, {Component, Fragment} from 'react';

import PropTypes from 'prop-types';

import {Tooltip} from 'antd';

import {FormattedNumber, FormattedDate} from 'react-intl';

import NavBar from './layout/NavBar';

import ComposeBtn from './elements/ComposeBtn';
import UserAvatar from './elements/UserAvatar';
import FollowControls from './elements/FollowControls';

import {getFollowCount, getAccount} from '../backend/steem-client';

import {getActiveVotes, getTopPosts} from '../backend/esteem-client';

import authorReputation from '../utils/author-reputation';
import {votingPower} from '../utils/manabar';
import proxifyImageSrc from '../utils/proxify-image-src';
import {makeGroupKeyForEntries} from "../actions/entries";
import EntryListLoadingItem from "./elements/EntryListLoadingItem";
import EntryListItem from "./elements/EntryListItem";
import AppFooter from "./layout/AppFooter";
import ScrollReplace from "./helpers/ScrollReplace";
import ListSwitch from "./elements/ListSwitch";
import coverFallbackDay from '../img/cover-fallback-day.png';
import coverFallbackNight from '../img/cover-fallback-night.png';
import LinearProgress from "./common/LinearProgress";

import catchEntryImage from '../utils/catch-entry-image';
import entryBodySummary from "../utils/entry-body-summary";

class Profile extends Component {

  render() {

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

    const {username, account} = this.props;

    if (account) {
      vPower = votingPower(account);
      vPowerPercentage = `${parseInt(vPower, 10)}%`;
      reputation = authorReputation(account.reputation);
      postCount = account.post_count;
      ({activeVotes} = account);
      ({followerCount} = account);
      ({followingCount} = account);

      const {accountProfile} = account;
      if (accountProfile) {
        name = accountProfile.name || null;
        about = accountProfile.about || null;
        location = accountProfile.location || null;
        website = accountProfile.website || null;
      }

      created = new Date(account.created);
    }

    return (
      <div className="profile-area">
        <div className="account-avatar">
          <UserAvatar user={username} size="xLarge"/>
          {reputation && <div className="reputation">{reputation}</div>}
        </div>

        <div className="username">{username}</div>

        {vPowerPercentage && (
          <div className="vpower-line">
            <div
              className="vpower-line-inner"
              style={{width: vPowerPercentage}}
            />
          </div>
        )}

        {vPower && (
          <div className="vpower-percentage">
            <Tooltip title="Voting Power">
              {vPower.toFixed(2)}
            </Tooltip>
          </div>
        )}

        {name && <div className="full-name">{name}</div>}

        {about && <div className="about">{about}</div>}

        {(name || about) && <div className="divider"/>}

        <div className="account-numbers">
          <div className="account-prop">
            <Tooltip title="Post Count" className="holder-tooltip">
              <i className="mi">list</i>
              {typeof postCount === 'number' ? (
                <FormattedNumber value={postCount}/>
              ) : (
                <span>--</span>
              )}
            </Tooltip>
          </div>
          <div className="account-prop">
            <Tooltip
              title="Number of votes in last 24 hours"
              className="holder-tooltip"
            >
              <i className="mi active-votes-icon">keyboard_arrow_up</i>
              {typeof activeVotes === 'number' ? (
                <FormattedNumber value={activeVotes}/>
              ) : (
                <span>--</span>
              )}
            </Tooltip>
          </div>
          <div className="account-prop">
            <Tooltip title="Followers" className="holder-tooltip">
              <i className="mi">people</i>
              {typeof followerCount === 'number' ? (
                <FormattedNumber value={followerCount}/>
              ) : (
                <span>--</span>
              )}
            </Tooltip>
          </div>
          <div className="account-prop">
            <Tooltip title="Following" className="holder-tooltip">
              <i className="mi">person_add</i>
              {typeof followingCount === 'number' ? (
                <FormattedNumber value={followingCount}/>
              ) : (
                <span>--</span>
              )}
            </Tooltip>
          </div>
        </div>

        <div className="divider"/>

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
    )
  }
}


Profile.defaultProps = {
  account: null,
};

Profile.propTypes = {
  username: PropTypes.string.isRequired,
  account: PropTypes.instanceOf(Object)
};


export class AccountMenu extends Component {
  goSection = (section) => {
    const {history, username} = this.props;
    const u = section ? `/@${username}/${section}` : `/@${username}`;
    history.push(u);
  };

  render() {
    const {section} = this.props;

    return (
      <div className="account-menu">
        <div className="account-menu-items">
          <a role="none" className={`menu-item ${section === 'blog' && 'selected-item'}`} onClick={() => {
            this.goSection('blog')
          }}>Blog</a>
          <a role="none" className={`menu-item ${section === 'comments' && 'selected-item'}`} onClick={() => {
            this.goSection('comments')
          }}>Comments</a>
          <a role="none" className={`menu-item ${section === 'replies' && 'selected-item'}`} onClick={() => {
            this.goSection('replies')
          }}>Replies</a>
          <a role="none" className={`menu-item ${section === 'wallet' && 'selected-item'}`} onClick={() => {
            this.goSection('wallet')
          }}>Wallet</a>

        </div>

        <div className="page-tools">
          <ListSwitch {...this.props} />
        </div>
      </div>
    )
  }
}

AccountMenu.propTypes = {
  username: PropTypes.string.isRequired,
  section: PropTypes.string.isRequired,
  history: PropTypes.instanceOf(Object).isRequired
};

export class AccountCover extends Component {
  render() {
    let coverImage;

    const {account, username, global} = this.props;

    if (account) {
      const {accountProfile} = account;
      if (accountProfile) {
        coverImage = accountProfile.cover_image || null;
      }
    }

    const bgImage = coverImage && proxifyImageSrc(coverImage) || (global.theme === 'day' ? coverFallbackDay : coverFallbackNight);

    return <div className="account-cover">
      <div className="cover-image" style={{backgroundImage: `url('${bgImage}')`}}/>
      <div className="follow-controls-holder">
        <FollowControls {...this.props} targetUsername={username}/>
      </div>
    </div>
  }
}

AccountCover.defaultProps = {
  account: null,
};

AccountCover.propTypes = {
  username: PropTypes.string.isRequired,
  account: PropTypes.instanceOf(Object),
  global: PropTypes.shape({
    theme: PropTypes.string.isRequired
  }).isRequired
};

export class SectionBlog extends Component {


}

export class SectionComments extends Component {

}

export class SectionReplies extends Component {

}

export class SectionWallet extends Component {

}

class Account extends Component {
  constructor(props) {
    super(props);

    this.state = {
      account: null,
      topPosts: null
    };
  }

  componentDidMount() {
    const {match} = this.props;
    const {username} = match.params;

    // check user here

    this.fetchAccount();
    this.fetchEntries();
    this.fetchTopPosts();
  }

  componentDidUpdate(prevProps) {
    const {location} = this.props;

    if (location !== prevProps.location) {
      this.fetchEntries();

      const {match: newMatch} = this.props;
      const {match: oldMatch} = prevProps;

      const {username: newUsername} = newMatch.params;
      const {username: oldUsername} = oldMatch.params;

      if (newUsername !== oldUsername) {
        this.fetchAccount();
        this.fetchTopPosts();
      }
    }
  }

  fetchAccount = async () => {
    const {match} = this.props;
    const {username} = match.params;

    let {visitingAccount: account} = this.props;

    if (!(account && account.name === username)) {
      account = await getAccount(username);
    }

    // Profile data
    let accountProfile;
    try {
      accountProfile = JSON.parse(account.json_metadata).profile;
    } catch (err) {
      accountProfile = null;
    }

    account = Object.assign({}, account, {accountProfile});
    this.setState({account});

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

      account = Object.assign({}, account, {followerCount, followingCount});
      this.setState({account});
    }

    // Active votes
    let activeVotes;
    try {
      activeVotes = await getActiveVotes(username);
    } catch (err) {
      activeVotes = {count: 0};
    }

    account = Object.assign({}, account, {activeVotes: activeVotes.count});
    this.setState({account});
  };

  fetchEntries = () => {
    const {actions, match} = this.props;
    const {username, section = 'blog'} = match.params;
    actions.fetchEntries(section, `@${username}`);
  };

  fetchTopPosts = async () => {
    const {match} = this.props;
    const {username} = match.params;

    let topPosts;
    try {
      const resp = await getTopPosts(username);
      topPosts = resp.list;
    } catch (err) {
      topPosts = null;
    }

    this.setState({topPosts});
  };

  bottomReached = () => {
    const {actions, entries, match} = this.props;
    const {username, section = 'blog'} = match.params;

    const groupKey = makeGroupKeyForEntries(section, `@${username}`);
    const data = entries.get(groupKey);
    const loading = data.get('loading');
    const hasMore = data.get('hasMore');

    if (!loading && hasMore) {
      actions.fetchEntries(section, `@${username}`, true);
    }
  };

  refresh = () => {
    const {actions, match} = this.props;
    const {username, section = 'blog'} = match.params;

    this.fetchAccount();
    this.fetchTopPosts();
    actions.invalidateEntries(section, `@${username}`);
    actions.fetchEntries(section, `@${username}`, false);

    document.querySelector('#app-content').scrollTop = 0;
  };

  render() {
    const {entries, global, match} = this.props;
    const {account} = this.state;
    const {username, section = 'blog'} = match.params;
    const isWallet = section === 'wallet';

    const groupKey = makeGroupKeyForEntries(section, `@${username}`);

    const data = entries.get(groupKey);
    const entryList = data.get('entries');
    const loading = data.get('loading');

    const {topPosts} = this.state;


    return (
      <div className="wrapper">
        <NavBar
          {...this.props}
          reloadFn={() => {
            this.refresh();
          }}
          reloading={loading}
          favoriteFn={() => {
          }}
        />

        <div className="app-content account-page">
          <div className="page-header">
            <div className="left-side">
              <ComposeBtn {...this.props} />
            </div>
            <div className="right-side">
              <AccountMenu {...this.props} section={section} username={username}/>
            </div>
          </div>
          <div className="page-inner" id="app-content">
            <div className="left-side">
              <Profile {...this.props} username={username} account={account}/>
            </div>

            <div className="right-side">
              {!isWallet &&
              <AccountCover {...this.props} account={account} username={username}/>
              }

              {section === 'blog' && topPosts &&
              <div className="top-posts-list">
                <h2 className="top-posts-list-header">Top Posts</h2>

                <div className="top-posts-list-body">
                  {topPosts.map(p => (
                    <div className="top-posts-list-item" key={p.permlink}>
                      <div className="post-image">
                        <img alt="" src={catchEntryImage(p) || 'img/noimage.png'}/>
                      </div>

                      <div className="post-content">
                        <div className="post-title">{p.title}</div>
                        <div className="post-body">{entryBodySummary(p.body, 40)}</div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
              }

              {!isWallet &&
              <Fragment>
                <div className={`entry-list ${loading ? 'loading' : ''}`}>
                  <div
                    className={`entry-list-body ${
                      global.listStyle === 'grid' ? 'grid-view' : ''
                      }`}
                  >
                    {loading && entryList.size === 0 ? (
                      <EntryListLoadingItem/>
                    ) : (
                      ''
                    )}
                    {entryList.valueSeq().map(d => (
                      <EntryListItem key={d.id} {...this.props} entry={d} asAuthor={username}/>
                    ))}
                  </div>
                </div>
                {loading && entryList.size > 0 ? <LinearProgress/> : ''}
                <ScrollReplace {...this.props} selector="#app-content" onBottom={this.bottomReached}/>
              </Fragment>
              }
            </div>
          </div>
        </div>
        <AppFooter {...this.props} />

      </div>
    );
  }
}

Account.defaultProps = {
  visitingAccount: null,
  activeAccount: null
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
  visitingAccount: PropTypes.instanceOf(Object),
  activeAccount: PropTypes.instanceOf(Object)
};

export default Account;
