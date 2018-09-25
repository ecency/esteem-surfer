import React, {Component} from 'react';


import PropTypes from 'prop-types';


import {Modal} from 'antd';
import {FormattedHTMLMessage, FormattedMessage, injectIntl} from 'react-intl';


class PinCreate extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }



  render() {
    const {global} = this.props;


    return (
      null
    );
  }
}

PinCreate.propTypes = {
  global: PropTypes.shape({}).isRequired
};

export default injectIntl(PinCreate);
