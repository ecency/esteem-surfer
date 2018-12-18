/*
eslint-disable react/no-multi-comp
*/

import React, { Fragment, PureComponent } from 'react';
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl';
import QuickProfile from './helpers/QuickProfile';
import UserAvatar from './elements/UserAvatar';
import EntryLink from './helpers/EntryLink';
import NavBar from './layout/NavBar';
import LinearProgress from './common/LinearProgress';
import { Table } from 'antd';
import AppFooter from './layout/AppFooter';
import DeepLinkHandler from './helpers/DeepLinkHandler';
import PropTypes from 'prop-types';


class Transfer extends PureComponent {

  render() {
    const { intl, activeAccount } = this.props;


    const loading = false;

    return (
      <div className="wrapper">
        <NavBar
          {...Object.assign({}, this.props, {
            reloadFn: () => {
              this.refresh();
            },
            reloading: loading
          })}
        />
        <div className="app-content transfer-page">
          Transfer
        </div>
        <AppFooter {...this.props} />
        <DeepLinkHandler {...this.props} />
      </div>
    );
  }
}


Transfer.defaultProps = {
  activeAccount: null
};

Transfer.propTypes = {
  activeAccount: PropTypes.instanceOf(Object),
  global: PropTypes.shape({
    pin: PropTypes.string.isRequired
  }).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default injectIntl(Transfer);

