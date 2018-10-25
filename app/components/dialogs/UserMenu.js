import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {FormattedMessage} from 'react-intl';
import {Modal} from "antd";

import Login from './Login';
import UserAvatar from '../elements/UserAvatar';

import GalleryModal from '../Gallery';
import DraftsModal from '../Drafts';

class UserMenu extends Component {

  constructor(props) {
    super(props);

    this.state = {
      loginModalVisible: false,
      galleryModalVisible: false,
      draftsModalVisible: false
    };
  }

  logout = () => {
    const {actions, closeFn} = this.props;

    actions.logOut();
    closeFn();
  };

  loginAs = () => {
    const {closeFn} = this.props;

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

  onLoginSuccess = () => {
    this.setState({
      loginModalVisible: false
    });
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

  render() {
    const {activeAccount} = this.props;
    const {username} = activeAccount;
    const {accountData} = activeAccount;

    const {loginModalVisible, galleryModalVisible, draftsModalVisible} = this.state;

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
          <UserAvatar user={username} size="normal"/>
        </div>
        <div className="user-menu-items">
          <a
            className="menu-item"
            rel="profile"
            role="none"
            onClick={this.menuItemClicked}
          >
            <i className="mi">account_box</i>
            <FormattedMessage id="user-menu.profile"/>
          </a>
          <a
            className="menu-item"
            rel="bookmarks"
            role="none"
            onClick={this.menuItemClicked}
          >
            <i className="mi">star_border</i>
            <FormattedMessage id="user-menu.bookmarks"/>
          </a>
          <a
            className="menu-item"
            rel="favorites"
            role="none"
            onClick={this.menuItemClicked}
          >
            <i className="mi">favorite_border</i>
            <FormattedMessage id="user-menu.favorites"/>
          </a>
          <a
            className="menu-item"
            rel="favorites"
            role="none"
            onClick={this.draftsClicked}
          >
            <i className="mi">insert_drive_file</i>
            <FormattedMessage id="user-menu.drafts"/>
          </a>
          <a
            className="menu-item"
            rel="schedules"
            role="none"
            onClick={this.menuItemClicked}
          >
            <i className="mi">today</i>
            <FormattedMessage id="user-menu.schedules"/>
          </a>
          <a
            className="menu-item"
            rel="gallery"
            role="none"
            onClick={this.galleryClicked}
          >
            <i className="mi">image</i>
            <FormattedMessage id="user-menu.gallery"/>
          </a>
          <a
            className="menu-item"
            rel="login-as"
            role="none"
            onClick={this.loginAs}
          >
            <i className="mi">supervisor_account</i>
            <FormattedMessage id="user-menu.login-as"/>
          </a>
          <a
            className="menu-item"
            rel="logout"
            role="none"
            onClick={this.logout}
          >
            <i className="mi">exit_to_app</i>
            <FormattedMessage id="user-menu.logout"/>
          </a>
        </div>

        <Modal
          visible={loginModalVisible}
          onCancel={this.onLoginModalCancel}
          footer={false}
          width="500px"
          closable={false}
          destroyOnClose
          centered
        >
          <Login {...this.props} onSuccess={this.onLoginSuccess}/>
        </Modal>

        <GalleryModal visible={galleryModalVisible} onCancel={this.onGalleryModalCancel} {...this.props} />
        <DraftsModal visible={draftsModalVisible} onCancel={this.onDraftsModalCancel} {...this.props} />
      </div>
    );
  }
}

UserMenu.propTypes = {
  actions: PropTypes.shape({
    logOut: PropTypes.func.isRequired
  }).isRequired,
  activeAccount: PropTypes.instanceOf(Object).isRequired,
  closeFn: PropTypes.func.isRequired
};

export default UserMenu;
