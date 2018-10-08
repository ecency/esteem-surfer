import React, { Component } from 'react';

import PropTypes from 'prop-types';
import NavBar from './layout/NavBar';

class Profile extends Component {
  refresh = () => {};

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
      </div>
    );
  }
}

Profile.propTypes = {
  actions: PropTypes.shape({
    fetchEntries: PropTypes.func.isRequired,
    invalidateEntries: PropTypes.func.isRequired,
    changeTheme: PropTypes.func.isRequired,
    changeListStyle: PropTypes.func.isRequired
  }).isRequired,
  global: PropTypes.shape({
    listStyle: PropTypes.string.isRequired
  }).isRequired,
  entries: PropTypes.shape({}).isRequired,
  location: PropTypes.shape({}).isRequired,
  history: PropTypes.shape({}).isRequired
};

export default Profile;
