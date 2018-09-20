import * as React from 'react';
import PropTypes from 'prop-types';

class App extends React.Component {
  render() {
    const { children } = this.props;
    return <React.Fragment>{children}</React.Fragment>;
  }
}

App.propTypes = {
  children: PropTypes.element.isRequired
};

export default App;
