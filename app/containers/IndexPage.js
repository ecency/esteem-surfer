import { Component } from 'react';
import PropTypes from 'prop-types';

class HomePage extends Component {
  componentWillMount() {
    const { history } = this.props;
    history.push('/trending');
  }

  render() {
    return '<span />';
  }
}

HomePage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

export default HomePage;
