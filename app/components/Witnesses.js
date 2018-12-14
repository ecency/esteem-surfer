import React, { PureComponent } from 'react';

import PropTypes from 'prop-types';

import NavBar from './layout/NavBar';
import AppFooter from './layout/AppFooter';
import DeepLinkHandler from './helpers/DeepLinkHandler';

class Witnesses extends PureComponent {
  constructor(props) {
    super(props);

  }

  render() {
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

        <div className="app-content witnesses-page">
          AAA
        </div>
        <AppFooter {...this.props} />
        <DeepLinkHandler {...this.props} />
      </div>
    );
  }
}

Witnesses.defaultProps = {
  activeAccount: null
};

Witnesses.propTypes = {
  activeAccount: PropTypes.instanceOf(Object)
};

export default Witnesses;