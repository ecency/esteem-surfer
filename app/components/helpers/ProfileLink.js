import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getAccount } from '../../backend/steem-client';

class ProfileLink extends Component {
  goProfile = async () => {
    const { username, history, actions } = this.props;
    let { accountData } = this.props;
    const { setVisitingProfile } = actions;

    if (!accountData) {
      try {
        accountData = await getAccount(username);
      } catch (err) {
        accountData = null;
      }
    }

    if (accountData) {
      setVisitingProfile(accountData);
    }

    history.push(`/@${username}`);
  };

  render() {
    const { children } = this.props;

    return React.cloneElement(children, {
      onClick: this.goProfile
    });
  }
}

ProfileLink.defaultProps = {
  accountData: null
};

ProfileLink.propTypes = {
  children: PropTypes.element.isRequired,
  username: PropTypes.string.isRequired,
  history: PropTypes.instanceOf(Object).isRequired,
  accountData: PropTypes.instanceOf(Object),
  actions: PropTypes.shape({
    setVisitingProfile: PropTypes.func.isRequired
  }).isRequired
};

export default ProfileLink;
