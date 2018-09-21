import React, { Component } from 'react';

import PropTypes from 'prop-types';

class UserAvatar extends Component {
  render() {
    const { user, size } = this.props;
    const imgSize = size === 'xLarge' ? 'large' : 'medium';
    const cls = `user-avatar ${size}`;

    return (
      <span
        key="user-avatar-image"
        className={cls}
        style={{
          backgroundImage: `url('https://steemitimages.com/u/${user}/avatar/${imgSize}')`
        }}
      />
    );
  }
}

UserAvatar.propTypes = {
  user: PropTypes.string.isRequired,
  size: PropTypes.string.isRequired
};

export default UserAvatar;
