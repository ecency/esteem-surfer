import React, {Component} from 'react';

import PropTypes from 'prop-types';

class UserAvatar extends Component {
  render() {
    const {user, size, onClick} = this.props;
    const imgSize = size === 'xLarge' ? 'large' : 'medium';
    const cls = `user-avatar ${size}`;

    return (
      <span onClick={onClick}
            role="none"
            key="user-avatar-image"
            className={cls}
            style={{
              backgroundImage: `url('https://steemitimages.com/u/${user}/avatar/${imgSize}')`
            }}
      />
    );
  }
}

UserAvatar.defaultProps = {
  onClick: () => {
  }
};

UserAvatar.propTypes = {
  user: PropTypes.string.isRequired,
  size: PropTypes.string.isRequired,
  onClick: PropTypes.func
};

export default UserAvatar;
