import React, {Component} from 'react';

import PropTypes from 'prop-types';

import {Row, Col, Select, Switch, message} from 'antd';
import {FormattedMessage, injectIntl} from 'react-intl';

import currencies from '../../constants/currencies'
import languages from '../../constants/languages'

import {getCurrencyRate} from '../../backend/esteem-client';
import {changeLanguage} from "../../actions/global";

class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      rateFetching: false
    }
  }

  async currencyChanged(e) {
    const {actions, intl} = this.props;
    const {changeCurrency} = actions;

    let r;
    try {
      r = await getCurrencyRate(e);
    } catch (err) {
      message.error(intl.formatMessage({id: 'settings.currency-fetch-error'}, {cur: e}));
      return false;
    }

    changeCurrency(e, r.data);
    message.success(intl.formatMessage({id: 'settings.currency-changed'}));
  }

  languageChanged(e) {
    const {actions, intl} = this.props;
    const {changeLanguage} = actions;
    changeLanguage(e);
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
    changeCurrency: PropTypes.func.isRequired,
    changeLanguage: PropTypes.func.isRequired
  }).isRequired,
  global: PropTypes.shape({
    currency: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired
  }).isRequired
};

export default injectIntl(Settings);
