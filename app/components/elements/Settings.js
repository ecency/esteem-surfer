import React, {Component} from 'react';

import PropTypes from 'prop-types';

import {Row, Col, Select, Switch, message} from 'antd';
import {FormattedMessage, injectIntl} from 'react-intl';

import currencies from '../../constants/currencies'
import {locales} from '../../locales';

import {getCurrencyRate} from '../../backend/esteem-client';

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

  localeChanged(e) {
    const {actions, intl} = this.props;
    const {changeLocale} = actions;
    changeLocale(e);
    message.success(intl.formatMessage({id: 'settings.locale-changed'}));
  }

  pushChanged(e) {
    this.setState({push: e})
  }

  render() {

    const {global} = this.props;
    const {currency, locale} = global;

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
          <Col offset={2} span={4} className="label-col"><FormattedMessage id="settings.locale"/></Col>
          <Col span={18}>
            <Select defaultValue={locale} showSearch style={{width: '100%'}} onChange={(e) => {
              this.localeChanged(e)
            }}>
              {locales.map(c => (
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
    changeLocale: PropTypes.func.isRequired
  }).isRequired,
  global: PropTypes.shape({
    currency: PropTypes.string.isRequired,
    locale: PropTypes.string.isRequired
  }).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default injectIntl(Settings);
