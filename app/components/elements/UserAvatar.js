import React, { Component } from 'react';

import PropTypes from 'prop-types';

class UserAvatar extends Component {
  render() {
    const { user, size, activeAccount, onClick } = this.props;
    const imgSize = size === 'xLarge' ? 'large' : 'medium';
    const cls = `user-avatar ${size}`;

    let v = '0';
    if (activeAccount && user === activeAccount.username) {
      const { accountData } = activeAccount;
      if (accountData) {
        v = accountData.last_account_update;
      }
    }

    return (
      <span
        onClick={onClick}
        role="none"
        key="user-avatar-image"
        className={cls}
        style={{
          backgroundImage: `url('https://steemitimages.com/u/${user}/avatar/${imgSize}?v=${v}')`
        }}
      />
    );
  }
}

UserAvatar.defaultProps = {
  activeAccount: null,
  onClick: () => {}
};

UserAvatar.propTypes = {
  user: PropTypes.string.isRequired,
  size: PropTypes.string.isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  onClick: PropTypes.func
};

export default UserAvatar;
