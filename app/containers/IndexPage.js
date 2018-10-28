import React, {Component} from 'react';
import PropTypes from 'prop-types';
import connect from "react-redux/es/connect/connect";

import defaults from '../constants/defaults';

class HomePage extends Component {
  componentWillMount() {
    const {history} = this.props;
    history.push(`/${defaults.filter}`);
  }

  render() {
    return <span/>;
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


export default connect(
  mapStateToProps
)(HomePage);