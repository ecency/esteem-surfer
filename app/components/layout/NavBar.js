/* eslint-disable jsx-a11y/anchor-has-content,react/no-multi-comp */

import React, { Component, Fragment } from 'react';

import PropTypes from 'prop-types';

import { Tooltip, Modal, Drawer } from 'antd';
import { FormattedMessage, injectIntl } from 'react-intl';

import Mi from '../common/Mi';
import UserAvatar from '../elements/UserAvatar';

import Settings from '../dialogs/Settings';
import Login from '../dialogs/Login';
import UserMenu from '../dialogs/UserMenu';
import LoginRequired from '../helpers/LoginRequired';

import addressParser from '../../utils/address-parser';
import { getContent, getAccount } from '../../backend/steem-client';

export const checkPathForBack = path => {
  if (!path) {
    return false;
  }

  return !['/'].includes(path);
};

class Address extends Component {
  constructor(props) {
    super(props);

    this.state = {
      address: '',
      realAddress: '',
      changed: false
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
      address: e.target.value.trim(),
      changed: true
    });
  };

  addressKeyup = async e => {
    if (e.keyCode === 13) {
      const { address, changed } = this.state;
      const { history } = this.props;

      if (!changed) return;

      const a = addressParser(address);

      if (a.type === 'filter') {
        const { path } = a;
        history.push(path);
        return;
      }

      if (a.type === 'post') {
        const { author, permlink, path } = a;
        const content = await getContent(author, permlink);

        if (content.id) {
          history.push(path);
          return;
        }
      }

      if (a.type === 'author') {
        const { author, path } = a;
        const account = await getAccount(author);

        if (account) {
          history.push(path);
          return;
        }
      }
    }

    if (e.keyCode === 27) {
      const { realAddress } = this.state;

      this.setState({ address: realAddress });
    }
  };

  render() {
    const { address } = this.state;

    return (
      <div className="address">
        <span className="protocol">esteem://</span>
        <input
          className="url"
          value={address}
          onChange={this.addressChanged}
          onKeyUp={this.addressKeyup}
        />
      </div>
    );
  }
}

Address.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    entries: PropTypes.array.isRequired,
    index: PropTypes.number.isRequired
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }).isRequired
};

class NavBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      settingsModalVisible: false,
      loginModalVisible: false,
      menuVisible: false
    };
  }

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
    const { location, global } = this.props;
    const { selectedFilter } = global;

    const newLoc = `/${selectedFilter}`;

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
      intl
    } = this.props;

    const { settingsModalVisible, loginModalVisible, menuVisible } = this.state;

    let canGoBack = false;
    if (history.entries[history.index - 1]) {
      canGoBack = checkPathForBack(history.entries[history.index - 1].pathname);
    }

    const canGoForward = !!history.entries[history.index + 1];

    const backClassName = `back ${!canGoBack ? 'disabled' : ''}`;
    const forwardClassName = `forward ${!canGoForward ? 'disabled' : ''}`;
    const reloadClassName = `reload ${reloading ? 'disabled' : ''}`;

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
            <div className="pre-add-on">
              <Mi icon="search" />
            </div>
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
                  title={intl.formatMessage({ id: 'navbar.wallet' })}
                  placement="left"
                  mouseEnterDelay={1}
                  onClick={this.walletClicked}
                >
                  <a role="none" className="wallet">
                    <i className="mi">credit_card</i>
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
