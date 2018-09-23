import React, { Component } from 'react';
import PropTypes from 'prop-types';
import defaults from '../constants/defaults';

class HomePage extends Component {
  componentWillMount() {
    const { history } = this.props;
    history.push(`/${defaults.filter}`);
  }

  render() {
    return <span />;
  }
}

HomePage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

export default HomePage;
