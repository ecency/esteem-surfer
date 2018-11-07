import React, { Component } from 'react';
import connect from 'react-redux/es/connect/connect';

import PropTypes from 'prop-types';

import { makePath as makePathEntry } from '../components/helpers/EntryLink';
import { isReleasePostRead, setReleasePostRead } from '../helpers/storage';

import { releasePost, version } from '../../package.json';

import defaults from '../constants/defaults';

class HomePage extends Component {
  componentWillMount() {
    const { history, activeAccount } = this.props;

    if (!isReleasePostRead(version)) {
      const [category, author, permlink] = releasePost.split('/');
      const loc = makePathEntry(category, author.replace('@', ''), permlink);
      setReleasePostRead(version);
      history.push(loc);
      return;
    }

    if (activeAccount) {
      history.push(`/@${activeAccount.username}/feed`);
      return;
    }

    history.push(`/${defaults.filter}`);
  }

  render() {
    return <span />;
  }
}

HomePage.defaultProps = {
  activeAccount: null
};

HomePage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  activeAccount: PropTypes.instanceOf(Object)
};

const mapStateToProps = state => ({
  activeAccount: state.activeAccount
});

export default connect(mapStateToProps)(HomePage);
