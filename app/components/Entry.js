/*
eslint-disable react/no-multi-comp
*/

import React, {Component} from 'react';
import PropTypes from "prop-types";
import {injectIntl} from "react-intl";

class Entry extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }


  render() {
    return <span>Foo</span>
  }
}


Entry.defaultProps = {
  activeAccount: null
};

Entry.propTypes = {
  activeAccount: PropTypes.instanceOf(Object)
};

export default injectIntl(Entry);
