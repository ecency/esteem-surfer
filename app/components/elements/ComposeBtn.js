import React, { Component } from 'react';

import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';

class ComposeBtn extends Component {
  shouldComponentUpdate() {
    return false;
  }

  clicked = () => {
    const { history } = this.props;

    history.push('/new');
  };

  render() {
    return (
      <div className="btn-compose" onClick={this.clicked} role="none">
        <span className="icon">
          <i className="mi">edit</i>
        </span>
        <FormattedMessage id="g.compose-entry" />
      </div>
    );
  }
}

ComposeBtn.propTypes = {
  history: PropTypes.instanceOf(Object).isRequired
};

export default ComposeBtn;
