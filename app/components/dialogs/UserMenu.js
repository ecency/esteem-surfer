import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {FormattedMessage} from 'react-intl';

import UserAvatar from '../elements/UserAvatar';

class UserMenu extends Component {

  logout = () => {
    const {actions, closeFn} = this.props;

    actions.deactivateAccount();
    closeFn();
  };

  menuItemClicked = e => {
    const rel = e.target.getAttribute('rel');
  };

  render() {
    const {accounts} = this.props;
    const {activeAccount} = accounts;
    const {username} = activeAccount;
    const {accountData} = activeAccount;

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
            onClick={this.menuItemClicked}
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
            onClick={this.menuItemClicked}
          >
            <i className="mi">image</i>
            <FormattedMessage id="user-menu.gallery"/>
          </a>
          <a
            className="menu-item"
            rel="login-as"
            role="none"
            onClick={this.menuItemClicked}
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
      </div>
    );
  }
}

UserMenu.propTypes = {
  actions: PropTypes.shape({
    deactivateAccount: PropTypes.func.isRequired
  }).isRequired,
  accounts: PropTypes.shape({
    activeAccount: PropTypes.instanceOf(Object)
  }).isRequired,
  closeFn: PropTypes.func.isRequired
};

export default UserMenu;
