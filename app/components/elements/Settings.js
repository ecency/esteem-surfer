import React, {Component} from 'react';

import PropTypes from 'prop-types';

import {Row, Col, Select, Switch} from 'antd';
import {FormattedMessage} from 'react-intl';

import currencies from '../../constants/currencies'
import languages from '../../constants/languages'

class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      saved: false
    }
  }

  currencyChanged(e) {
    const {actions} = this.props;
    const {changeCurrency} = actions;

    changeCurrency(e);
  }

  languageChanged(e) {
    this.setState({lang: e})
  }

  pushChanged(e) {
    this.setState({push: e})
  }

  render() {

    const {global} = this.props;
    const {currency, language} = global;


    return (
      <div className="settings-modal-content">
        <Row className="row">
          <Col offset={2} span={4} className="label-col"><FormattedMessage id="settings.currency"/></Col>
          <Col span={18}>
            <Select defaultValue={currency} showSearch style={{width: '100%'}} onChange={(e) => {
              this.currencyChanged(e)
            }}>
              {currencies.map(c => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Row className="row">
          <Col offset={2} span={4} className="label-col"><FormattedMessage id="settings.language"/></Col>
          <Col span={18}>
            <Select defaultValue={language} showSearch style={{width: '100%'}} onChange={(e) => {
              this.languageChanged(e)
            }}>
              {languages.map(c => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Row className="row">
          <Col offset={2} span={4} className="label-col"><FormattedMessage id="settings.server"/></Col>
          <Col span={18}/>
        </Row>
        <Row>
          <Col offset={6} span={18} style={{display: "flex", alignItems: "center"}}>
            <Switch style={{marginRight: "20px"}} onChange={(e) => {
              this.pushChanged(e)
            }}/>
            <FormattedMessage id="settings.push-notifications"/>
          </Col>
        </Row>
      </div>
    )
  }
}

Settings.propTypes = {
  actions: PropTypes.shape({
    changeCurrency: PropTypes.func.isRequired
  }).isRequired,
  global: PropTypes.shape({
    currency: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired
  }).isRequired
};

export default Settings;
