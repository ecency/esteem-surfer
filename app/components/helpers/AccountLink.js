import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getAccount } from '../../backend/steem-client';

export const makePath = username => `/@${username}`;

class AccountLink extends Component {
  goProfile = async () => {
    const { username, history, actions, onClick, afterClick } = this.props;

    onClick();

    let { accountData } = this.props;
    const { setVisitingAccount } = actions;

    if (!accountData) {
      try {
        accountData = await getAccount(username);
      } catch (err) {
        accountData = null;
      }
    }

    if (accountData) {
      setVisitingAccount(accountData);
    }

    history.push(makePath(username));

    afterClick();
  };

  render() {
    const { children } = this.props;

    return React.cloneElement(children, {
      onClick: this.goProfile
    });
  }
}

AccountLink.defaultProps = {
  accountData: null,
  onClick: () => {},
  afterClick: () => {}
};

AccountLink.propTypes = {
  children: PropTypes.element.isRequired,
  username: PropTypes.string.isRequired,
  history: PropTypes.instanceOf(Object).isRequired,
  accountData: PropTypes.instanceOf(Object),
  onClick: PropTypes.func,
  afterClick: PropTypes.func,
  actions: PropTypes.shape({
    setVisitingAccount: PropTypes.func.isRequired
  }).isRequired
};

export default AccountLink;
