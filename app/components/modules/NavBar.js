/* eslint-disable jsx-a11y/anchor-has-content */

import React, { Component } from 'react';

import PropTypes from 'prop-types';

import { Tooltip, Modal } from 'antd';

import Mi from '../elements/Mi';

export const checkPathForBack = path => {
  if (!path) {
    return false;
  }

  return !['/', '/welcome', '/set-pin'].includes(path);
};

class NavBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      settingsModalVisible: false
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

  render() {
    const {
      history,
      reloading,
      favoriteFn,
      favoriteFlag,
      bookmarkFn,
      bookmarkFlag,
      postBtnActive
    } = this.props;

    const { settingsModalVisible } = this.state;

    let canGoBack = false;
    if (history.entries[history.index - 1]) {
      canGoBack = checkPathForBack(history.entries[history.index - 1].pathname);
    }

    const curPath = history.entries[history.index].pathname;
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
            <span className="icon">
              <Mi icon="edit" />
            </span>
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
            <div className="address">
              <span className="protocol">esteem://</span>
              <span className="url">{curPath.replace('/', '')}</span>
            </div>
            {favoriteFn ? (
              <a
                className={`post-add-on ${!favoriteFlag ? 'disabled' : ''}`}
                onClick={() => this.favorite()}
                role="none"
              >
                <Mi icon="star_border" />
              </a>
            ) : (
              ''
            )}
            {bookmarkFn ? (
              <a
                className={`post-add-on ${!bookmarkFlag ? 'disabled' : ''}`}
                onClick={() => this.bookmark()}
                role="none"
              >
                <Mi icon="bookmark" />
              </a>
            ) : (
              ''
            )}
          </div>
          <div className="alt-controls">
            <a
              className="switch-theme"
              onClick={() => {
                this.changeTheme();
              }}
              role="none"
            >
              <Mi icon="brightness_medium" />
            </a>
            <a
              className="settings"
              onClick={() => {
                this.showSettingsModal();
              }}
              role="none"
            >
              <Mi icon="settings" />
            </a>
          </div>
          <div className="user-menu">
            <Tooltip
              title="Login to you account"
              placement="left"
              mouseEnterDelay={2}
            >
              <a className="login">
                <Mi icon="account_circle" />
              </a>
            </Tooltip>
          </div>
        </div>

        <Modal
          visible={settingsModalVisible}
          onCancel={this.onSettingsModalCancel}
          footer={false}
          width="60%"
          title="Settings"
          closable={false}
          centered
        >
          Hello
        </Modal>
      </div>
    );
  }
}

NavBar.defaultProps = {
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
  postBtnActive: PropTypes.bool
};

export default NavBar;
