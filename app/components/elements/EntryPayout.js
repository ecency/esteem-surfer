import React, { Component } from 'react';

import PropTypes from 'prop-types';

import { Popover } from 'antd';

import EntryPayoutContent from './EntryPayoutContent';

class EntryPayout extends Component {
  render() {
    const { children } = this.props;

    return (
      <Popover
        key="payout-popover"
        content={<EntryPayoutContent {...this.props} />}
        placement="bottom"
      >
        {children}
      </Popover>
    );
  }
}

EntryPayout.propTypes = {
  children: PropTypes.element.isRequired
};

export default EntryPayout;
