/* eslint-disable jsx-a11y/anchor-has-content,react/no-multi-comp */

import React, { Component, Fragment } from 'react';

import PropTypes from 'prop-types';

import { Modal, Drawer, Icon } from 'antd';
import { FormattedMessage, injectIntl } from 'react-intl';

import Tooltip from '../common/Tooltip';

import Mi from '../common/Mi';
import UserAvatar from '../elements/UserAvatar';

import Settings from '../dialogs/Settings';
import Login from '../dialogs/Login';
import UserMenu from '../dialogs/UserMenu';
import Activities from '../dialogs/Activities';
import LoginRequired from '../helpers/LoginRequired';
import SearchInPage from '../helpers/SearchInPage';

import addressParser from '../../utils/address-parser';

import { getContent, getAccount } from '../../backend/steem-client';

import { searchSort, filter as defaultFilter } from '../../constants/defaults';

import parseToken from '../../utils/parse-token';

import qsParse from '../../utils/qs';

export const checkPathForBack = path => {
  if (!path) {
    return false;
  }

  return !['/'].includes(path);
};

class Address extends Component {
  constructor(props) {
    super(props);

    const { location } = this.props;
    const inSearchPage = location.pathname.startsWith('/search');

    this.state = {
      address: '',
      addressType: inSearchPage ? 'search' : 'url',
      realAddress: '',
      changed: false,
      inSearchPage,
      inProgress: false
    };
  }

  componentDidMount() {
    this.fixAddress();
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props;

    if (location !== prevProps.location) {
      this.fixAddress();
    }
  }

  fixAddress = () => {
    const { history } = this.props;
    const curPath = history.entries[history.index].pathname;
    const address = curPath.replace('/', '');

    this.setState({ address, realAddress: address });
  };

  addressChanged = e => {
    this.setState({
      address: e.target.value,
      changed: true
    });
  };

  gotoAddress = async address => {
    const a = addressParser(address);
    const { history, activeAccount } = this.props;

    if (a.type === 'filter') {
      const { path } = a;
      history.push(path);
      return;
    }

    if (a.type === 'post') {
      const { author, permlink } = a;

      this.setState({ inProgress: true });
      const content = await getContent(author, permlink);
      this.setState({ inProgress: false });

      if (content.id) {
        const path = `/${content.category}/@${content.author}/${
          content.permlink
        }`;
        history.push(path);
        return;
      }
    }

    if (a.type === 'author') {
      const { author, path } = a;

      this.setState({ inProgress: true });
      const account = await getAccount(author);
      this.setState({ inProgress: false });

      if (account) {
        history.push(path);
        return;
      }
    }

    if (a === 'feed' && activeAccount) {
      const p = `@${activeAccount.username}/feed`;
      history.push(p);
      return;
    }

    if (a === 'witnesses') {
      const p = `/witnesses`;
      history.push(p);
      return;
    }

    if (a === 'transfer' && activeAccount) {
      const p = `/@${activeAccount.username}/transfer/steem`;
      history.push(p);
      return;
    }

    const q = address.replace(/\//g, ' ');

    this.searchKeyword(q);
  };

  searchKeyword(q) {
    const { history } = this.props;

    history.push(`/search?q=${encodeURIComponent(q)}&sort=${searchSort}`);
  }

  addressKeyup = async e => {
    if (e.keyCode === 13) {
      const { address, changed } = this.state;

      if (!changed) return;

      if (address.trim() === '') {
        return;
      }

      this.gotoAddress(address);
    }

    if (e.keyCode === 27) {
      const { realAddress } = this.state;

      this.setState({ address: realAddress });
    }
  };

  searchKeyup = e => {
    if (e.keyCode !== 13) return;

    const q = document.querySelector('#txt-search').value.trim();
    if (!q) {
      document.querySelector('#txt-search').focus();
      return;
    }

    // if query starts with @, try to visit the page before search.
    if (q[0] === '@') {
      this.toggle();
      this.gotoAddress(q);
      return;
    }

    this.searchKeyword(q);
  };

  toggle = () => {
    const { addressType } = this.state;

    if (addressType === 'url') {
      this.setState({ addressType: 'search' }, () => {
        document.querySelector('#txt-search').focus();
      });
    }

    if (addressType === 'search') {
      this.setState({ addressType: 'url' });
    }
  };

  render() {
    const { location, intl } = this.props;

    const { address, addressType, inSearchPage, inProgress } = this.state;
    const styles = !inSearchPage ? { cursor: 'pointer' } : {};

    let q = '';
    if (location.pathname.startsWith('/search')) {
      const { search } = location;
      const qs = qsParse(search);
      ({ q } = qs);
    }

    return (
      <Fragment>
        <div className="address">
          <div
            className="pre-add-on"
            style={styles}
            onClick={this.toggle}
            role="none"
          >
            <i className="mi">search</i>
          </div>
          {addressType === 'url' && (
            <Fragment>
              <span className="protocol">esteem://</span>
              <input
                className="url"
                value={address}
                onChange={this.addressChanged}
                onKeyUp={this.addressKeyup}
                placeholder={intl.formatMessage({
                  id: 'navbar.address-enter-url'
                })}
                disabled={inProgress}
                spellCheck={false}
              />
              {inProgress && (
                <div className="in-progress">
                  <Icon type="loading" style={{ fontSize: 12 }} spin />
                </div>
              )}
            </Fragment>
          )}

          {addressType === 'search' && (
            <Fragment>
              <span className="protocol">search://</span>
              <input
                className="url"
                defaultValue={q}
                id="txt-search"
                onKeyUp={this.searchKeyup}
                placeholder={intl.formatMessage({
                  id: 'navbar.address-enter-query'
                })}
              />
            </Fragment>
          )}
        </div>
      </Fragment>
    );
  }
}

Address.defaultProps = {
  activeAccount: null
};

Address.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    entries: PropTypes.array.isRequired,
    index: PropTypes.number.isRequired
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }).isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  intl: PropTypes.instanceOf(Object).isRequired
};

class NavBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      settingsModalVisible: false,
      loginModalVisible: false,
      menuVisible: false,
      activitiesVisible: false
    };
  }

  componentDidMount() {
    window.addEventListener(
      'notification-clicked',
      this.externalNotificationClicked
    );
  }

  componentWillUnmount() {
    window.removeEventListener(
      'notification-clicked',
      this.externalNotificationClicked
    );
  }

  externalNotificationClicked = () => {
    const { activitiesVisible } = this.state;
    if (activitiesVisible) {
      return;
    }

    this.setState({
      activitiesVisible: true
    });
  };

  showSettingsModal = () => {
    this.setState({
      settingsModalVisible: true
    });
  };

  onSettingsModalCancel = () => {
    this.setState({
      settingsModalVisible: false
    });
  };

  showLoginModal = () => {
    this.setState({
      loginModalVisible: true
    });
  };

  onLoginModalCancel = () => {
    this.setState({
      loginModalVisible: false
    });
  };

  onLoginSuccess = username => {
    this.setState({
      loginModalVisible: false
    });

    const { location, history } = this.props;
    if (location.pathname.endsWith('/feed')) {
      const loc = `/@${username}/feed`;
      history.push(loc);
    }
  };

  toggleMenu = () => {
    const { menuVisible } = this.state;
    this.setState({ menuVisible: !menuVisible });
  };

  goBack = () => {
    const { history } = this.props;

    history.goBack();
  };

  goForward = () => {
    const { history } = this.props;

    history.goForward();
  };

  refresh = () => {
    const { reloadFn } = this.props;

    reloadFn();
  };

  favorite = () => {
    const { favoriteFn } = this.props;

    if (favoriteFn) favoriteFn();
  };

  bookmark = () => {
    const { bookmarkFn } = this.props;

    if (bookmarkFn) bookmarkFn();
  };

  changeTheme = () => {
    const { actions } = this.props;
    const { changeTheme } = actions;

    changeTheme();
  };

  logoClicked = () => {
    const { location, activeAccount } = this.props;

    const newLoc = activeAccount
      ? `/@${activeAccount.username}/feed`
      : `/${defaultFilter}`;

    if (newLoc === location.pathname) {
      document.querySelector('#app-content').scrollTop = 0;
      return;
    }

    const { history } = this.props;
    history.push(newLoc);
  };

  walletClicked = () => {
    const { activeAccount, history } = this.props;
    const u = `/@${activeAccount.username}/wallet`;
    history.push(u);
  };

  activitiesClicked = () => {
    this.setState({
      activitiesVisible: true
    });
  };

  toggleActivities = () => {
    const { activitiesVisible } = this.state;
    this.setState({ activitiesVisible: !activitiesVisible });
  };

  render() {
    const {
      history,
      reloading,
      favoriteFn,
      favoriteFlag,
      bookmarkFn,
      bookmarkFlag,
      postBtnActive,
      activeAccount,
      activities,
      intl
    } = this.props;

    const {
      settingsModalVisible,
      loginModalVisible,
      menuVisible,
      activitiesVisible
    } = this.state;

    let canGoBack = false;
    if (history.entries[history.index - 1]) {
      canGoBack = checkPathForBack(history.entries[history.index - 1].pathname);
    }

    const canGoForward = !!history.entries[history.index + 1];

    const backClassName = `back ${!canGoBack ? 'disabled' : ''}`;
    const forwardClassName = `forward ${!canGoForward ? 'disabled' : ''}`;
    const reloadClassName = `reload ${reloading ? 'disabled' : ''}`;

    const { unread: unreadActivity } = activities;

    let hasUnclaimedRewards = false;
    if (activeAccount) {
      const { accountData: account } = activeAccount;

      if (account) {
        const rewardSteemBalance = parseToken(account.reward_steem_balance);
        const rewardSbdBalance = parseToken(account.reward_sbd_balance);
        const rewardVestingSteem = parseToken(account.reward_vesting_steem);
        hasUnclaimedRewards =
          rewardSteemBalance > 0 ||
          rewardSbdBalance > 0 ||
          rewardVestingSteem > 0;
      }
    }

    return (
      <div className="nav-bar">
        <div className="nav-bar-inner">
          <a
            onClick={() => {
              this.logoClicked();
            }}
            className="logo"
            role="none"
            tabIndex="-1"
          />
          <div className={`btn-post-mini  ${postBtnActive ? 'visible' : ''}`}>
            <Tooltip
              title={intl.formatMessage({ id: 'g.compose-entry' })}
              placement="right"
              mouseEnterDelay={2}
            >
              <span
                className="icon"
                role="none"
                onClick={() => {
                  history.push('/new');
                }}
              >
                <i className="mi">edit</i>
              </span>
            </Tooltip>
          </div>
          <div className="nav-controls">
            <a
              className={backClassName}
              onClick={() => this.goBack()}
              role="none"
            >
              <Mi icon="arrow_back" />
            </a>
            <a
              className={forwardClassName}
              onClick={() => this.goForward()}
              role="none"
            >
              <Mi icon="arrow_forward" />
            </a>
            <a
              className={reloadClassName}
              onClick={() => this.refresh()}
              role="none"
            >
              <Mi icon="refresh" />
            </a>
          </div>
          <div className="address-bar">
            <SearchInPage {...this.props} />
            <Address {...this.props} />
            {favoriteFn ? (
              <LoginRequired {...this.props}>
                <a
                  className={`post-add-on ${favoriteFlag ? 'checked' : ''}`}
                  onClick={() => this.favorite()}
                  role="none"
                >
                  <Tooltip
                    title={
                      favoriteFlag
                        ? intl.formatMessage({ id: 'navbar.favoriteRemove' })
                        : intl.formatMessage({ id: 'navbar.favorite' })
                    }
                    mouseEnterDelay={2}
                  >
                    <i className="mi">star</i>
                  </Tooltip>
                </a>
              </LoginRequired>
            ) : (
              ''
            )}
            {bookmarkFn ? (
              <LoginRequired {...this.props}>
                <a
                  className={`post-add-on ${bookmarkFlag ? 'checked' : ''}`}
                  onClick={() => this.bookmark()}
                  role="none"
                >
                  <Tooltip
                    title={
                      bookmarkFlag
                        ? intl.formatMessage({ id: 'navbar.bookmarkRemove' })
                        : intl.formatMessage({ id: 'navbar.bookmark' })
                    }
                    mouseEnterDelay={2}
                  >
                    <i className="mi">bookmark</i>
                  </Tooltip>
                </a>
              </LoginRequired>
            ) : (
              ''
            )}
          </div>
          <div className="alt-controls">
            <Tooltip
              title={intl.formatMessage({ id: 'navbar.change-theme' })}
              placement="left"
              mouseEnterDelay={2}
            >
              <a
                className="switch-theme"
                onClick={() => {
                  this.changeTheme();
                }}
                role="none"
              >
                <Mi icon="brightness_medium" />
              </a>
            </Tooltip>
            <Tooltip
              title={intl.formatMessage({ id: 'navbar.settings' })}
              placement="left"
              mouseEnterDelay={2}
            >
              <a
                className="settings"
                onClick={() => {
                  this.showSettingsModal();
                }}
                role="none"
              >
                <Mi icon="settings" />
              </a>
            </Tooltip>
          </div>
          <div className={`user-menu ${activeAccount ? 'logged-in' : ''}`}>
            {!activeAccount && (
              <Tooltip
                title={intl.formatMessage({ id: 'navbar.login' })}
                placement="left"
                mouseEnterDelay={2}
              >
                <a
                  className="login"
                  role="none"
                  onClick={() => {
                    this.showLoginModal();
                  }}
                >
                  <Mi icon="account_circle" />
                </a>
              </Tooltip>
            )}

            {activeAccount && (
              <Fragment>
                <Tooltip
                  title={
                    hasUnclaimedRewards
                      ? intl.formatMessage({
                          id: 'navbar.unclaimed-reward-notice'
                        })
                      : intl.formatMessage({ id: 'navbar.wallet' })
                  }
                  placement="left"
                  mouseEnterDelay={1}
                  onClick={this.walletClicked}
                >
                  <a role="none" className="wallet">
                    {hasUnclaimedRewards && <span className="reward-badge" />}
                    <i className="mi">credit_card</i>
                  </a>
                </Tooltip>

                <Tooltip
                  title={intl.formatMessage({ id: 'navbar.activities' })}
                  placement="left"
                  mouseEnterDelay={1}
                  onClick={this.activitiesClicked}
                >
                  <a role="none" className="activities">
                    <i className="mi">notifications</i>
                    {unreadActivity > 0 && (
                      <span className="activity-badge">
                        {unreadActivity.toString().length < 3
                          ? unreadActivity
                          : '...'}
                      </span>
                    )}
                  </a>
                </Tooltip>

                <a
                  role="none"
                  className="user-menu-trigger"
                  onClick={this.toggleMenu}
                >
                  <UserAvatar user={activeAccount.username} size="normal" />
                </a>
              </Fragment>
            )}

            {activeAccount && (
              <Drawer
                placement="right"
                closable={false}
                onClose={this.toggleActivities}
                visible={activitiesVisible}
                width="540px"
                style={{ height: '100%' }}
              >
                <Activities {...this.props} />
              </Drawer>
            )}

            {activeAccount && (
              <Drawer
                placement="right"
                closable={false}
                onClose={this.toggleMenu}
                visible={menuVisible}
                width="200px"
              >
                <UserMenu {...this.props} closeFn={this.toggleMenu} />
              </Drawer>
            )}
          </div>
        </div>
        <Modal
          visible={settingsModalVisible}
          onCancel={this.onSettingsModalCancel}
          footer={false}
          width="600px"
          title={<FormattedMessage id="settings.title" />}
          destroyOnClose
          centered
        >
          <Settings {...this.props} />
        </Modal>

        <Modal
          visible={loginModalVisible}
          onCancel={this.onLoginModalCancel}
          footer={false}
          width="500px"
          closable={false}
          destroyOnClose
          centered
        >
          <Login {...this.props} onSuccess={this.onLoginSuccess} />
        </Modal>
      </div>
    );
  }
}

NavBar.defaultProps = {
  activeAccount: null,

  favoriteFn: undefined,
  favoriteFlag: false,

  bookmarkFn: undefined,
  bookmarkFlag: false,

  postBtnActive: false
};

NavBar.propTypes = {
  actions: PropTypes.shape({
    changeTheme: PropTypes.func.isRequired
  }).isRequired,
  global: PropTypes.shape({
    selectedFilter: PropTypes.string.isRequired
  }).isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  activities: PropTypes.instanceOf(Object).isRequired,
  history: PropTypes.shape({
    goForward: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    entries: PropTypes.array.isRequired,
    index: PropTypes.number.isRequired
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }).isRequired,
  reloadFn: PropTypes.func.isRequired,
  reloading: PropTypes.bool.isRequired,
  favoriteFn: PropTypes.func,
  favoriteFlag: PropTypes.bool,
  bookmarkFn: PropTypes.func,
  bookmarkFlag: PropTypes.bool,
  postBtnActive: PropTypes.bool,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default injectIntl(NavBar);
