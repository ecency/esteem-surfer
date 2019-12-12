import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';
import { Modal } from 'antd';

import Login from './Login';
import UserAvatar from '../elements/UserAvatar';

import GalleryModal from './Gallery';
import DraftsModal from './Drafts';
import SchedulesModal from './Schedules';
import BookmarksModal from './Bookmarks';
import FavoritesModal from './Favorites';

class UserMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loginModalVisible: false,
      galleryModalVisible: false,
      draftsModalVisible: false,
      schedulesModalVisible: false,
      bookmarksModalVisible: false,
      favoritesModalVisible: false
    };
  }

  logout = () => {
    const { actions, closeFn } = this.props;

    actions.logOut();

    const ev = new CustomEvent('user-logout', {});
    window.dispatchEvent(ev);

    closeFn();
  };

  loginAs = () => {
    const { closeFn } = this.props;

    this.setState({
      loginModalVisible: true
    });

    closeFn();
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

  galleryClicked = () => {
    this.setState({
      galleryModalVisible: true
    });
  };

  onGalleryModalCancel = () => {
    this.setState({
      galleryModalVisible: false
    });
  };

  profileClicked = () => {
    const { activeAccount, history } = this.props;
    const u = `/@${activeAccount.username}`;
    history.push(u);
  };

  draftsClicked = () => {
    this.setState({
      draftsModalVisible: true
    });
  };

  onDraftsModalCancel = () => {
    this.setState({
      draftsModalVisible: false
    });
  };

  schedulesClicked = () => {
    this.setState({
      schedulesModalVisible: true
    });
  };

  onSchedulesModalCancel = () => {
    this.setState({
      schedulesModalVisible: false
    });
  };

  bookmarksClicked = () => {
    this.setState({
      bookmarksModalVisible: true
    });
  };

  onBookmarksModalCancel = () => {
    this.setState({
      bookmarksModalVisible: false
    });
  };

  favoritesClicked = () => {
    this.setState({
      favoritesModalVisible: true
    });
  };

  onFavoritesModalCancel = () => {
    this.setState({
      favoritesModalVisible: false
    });
  };

  render() {
    const { activeAccount } = this.props;
    const { username } = activeAccount;
    const { accountData } = activeAccount;

    const {
      loginModalVisible,
      galleryModalVisible,
      draftsModalVisible,
      schedulesModalVisible,
      bookmarksModalVisible,
      favoritesModalVisible
    } = this.state;

    let displayName;
    try {
      const jsonMeta = JSON.parse(accountData.json_metadata);
      displayName = jsonMeta.profile.name || username;
    } catch (e) {
      displayName = username;
    }

    return (
      <div className="user-menu-content">
        <div className="menu-header">
          <span className="display-name">{displayName}</span>
          <UserAvatar {...this.props} user={username} size="normal" />
        </div>
        <div className="user-menu-items">
          <a
            className="menu-item"
            rel="profile"
            role="none"
            onClick={this.profileClicked}
          >
            <i className="mi">account_box</i>
            <FormattedMessage id="user-menu.profile" />
          </a>
          <a
            className="menu-item"
            rel="bookmarks"
            role="none"
            onClick={this.bookmarksClicked}
          >
            <i className="mi">bookmark</i>
            <FormattedMessage id="user-menu.bookmarks" />
          </a>
          <a
            className="menu-item"
            rel="favorites"
            role="none"
            onClick={this.favoritesClicked}
          >
            <i className="mi">star</i>
            <FormattedMessage id="user-menu.favorites" />
          </a>
          <a
            className="menu-item"
            rel="favorites"
            role="none"
            onClick={this.draftsClicked}
          >
            <i className="mi">insert_drive_file</i>
            <FormattedMessage id="user-menu.drafts" />
          </a>
          <a
            className="menu-item"
            rel="schedules"
            role="none"
            onClick={this.schedulesClicked}
          >
            <i className="mi">today</i>
            <FormattedMessage id="user-menu.schedules" />
          </a>
          <a
            className="menu-item"
            rel="gallery"
            role="none"
            onClick={this.galleryClicked}
          >
            <i className="mi">image</i>
            <FormattedMessage id="user-menu.gallery" />
          </a>
          <a
            className="menu-item"
            rel="login-as"
            role="none"
            onClick={this.loginAs}
          >
            <i className="mi">supervisor_account</i>
            <FormattedMessage id="user-menu.login-as" />
          </a>
          <a
            className="menu-item"
            rel="logout"
            role="none"
            onClick={this.logout}
          >
            <i className="mi">power_settings_new</i>
            <FormattedMessage id="user-menu.logout" />
          </a>
        </div>

        <Modal
          visible={loginModalVisible}
          onCancel={this.onLoginModalCancel}
          footer={false}
          width="500px"
          closable
          destroyOnClose
          centered
          maskClosable={false}
        >
          <Login {...this.props} onSuccess={this.onLoginSuccess} />
        </Modal>

        <GalleryModal
          visible={galleryModalVisible}
          onCancel={this.onGalleryModalCancel}
          {...this.props}
        />
        <DraftsModal
          visible={draftsModalVisible}
          onCancel={this.onDraftsModalCancel}
          {...this.props}
        />
        <SchedulesModal
          visible={schedulesModalVisible}
          onCancel={this.onSchedulesModalCancel}
          {...this.props}
        />
        <BookmarksModal
          visible={bookmarksModalVisible}
          onCancel={this.onBookmarksModalCancel}
          {...this.props}
        />
        <FavoritesModal
          visible={favoritesModalVisible}
          onCancel={this.onFavoritesModalCancel}
          {...this.props}
        />
      </div>
    );
  }
}

UserMenu.propTypes = {
  actions: PropTypes.shape({
    logOut: PropTypes.func.isRequired
  }).isRequired,
  history: PropTypes.instanceOf(Object).isRequired,
  activeAccount: PropTypes.instanceOf(Object).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }).isRequired,
  closeFn: PropTypes.func.isRequired
};

export default UserMenu;
