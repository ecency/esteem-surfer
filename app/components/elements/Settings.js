import React, {Component} from 'react';

import PropTypes from 'prop-types';

import {Row, Col, Select, Switch, Input, Button, message} from 'antd';
import {FormattedMessage, injectIntl} from 'react-intl';

import currencies from '../../constants/currencies';
import {locales} from '../../locales';
import {Client} from 'dsteem';

import {getCurrencyRate, getNodes} from '../../backend/esteem-client';

class Settings extends Component {

  constructor(props) {
    super(props);

    this.state = {
      nodes: [],
      showNodeList: false,
      tryingServer: false
    }
  }

  componentDidMount() {
    getNodes().then(resp => {
      this.setState({nodes: resp})
    })
  }

  toggleNodeList() {
    const {showNodeList} = this.state;
    this.setState({showNodeList: !showNodeList})
  }

  // setCurrency
  currencyChanged(e) {
    const {actions, intl} = this.props;
    const {changeCurrency} = actions;

    getCurrencyRate(e)
      .then(resp => {
        changeCurrency(e, resp.data);
        message.success(
          intl.formatMessage({id: 'settings.currency-changed'})
        );
        return resp;
      })
      .catch(() => {
        message.error(
          intl.formatMessage(
            {id: 'settings.currency-fetch-error'},
            {cur: e}
          )
        );
      });
  }

  // setLocale
  localeChanged(e) {
    const {actions, intl} = this.props;
    const {changeLocale} = actions;
    changeLocale(e);
    message.success(intl.formatMessage({id: 'settings.locale-changed'}));
  }

  // setPushNotify
  pushNotifyChanged(e) {
    const {actions, intl} = this.props;
    const {changePushNotify} = actions;
    changePushNotify(Number(e));

    if (e) {
      message.success(
        intl.formatMessage({id: 'settings.push-notify-enabled'})
      );
    } else {
      message.info(intl.formatMessage({id: 'settings.push-notify-disabled'}));
    }
  }

  async setServer(server) {
    const {actions, intl} = this.props;

    const client = new Client(server, {timeout: 5});

    this.setState({tryingServer: true});

    const hideMsg = message.loading(intl.formatMessage({id: 'settings.server-connecting'}, {server}), 0);

    let serverResp;
    try {
      serverResp = await client.database.getDynamicGlobalProperties();
    } catch (e) {
      message.error(intl.formatMessage({id: 'settings.server-connect-error'}, {server}));
      return;
    } finally {
      hideMsg();
      this.setState({tryingServer: false});
    }

    let localTime = new Date(new Date().toISOString().split('.')[0]);
    let serverTime = new Date(serverResp.time);
    let isAlive = (localTime - serverTime) < 15000;

    if (!isAlive) {
      message.error(intl.formatMessage({id: 'settings.server-timeout-error'}, {server}));
      return;
    }

    message.success(intl.formatMessage({id: 'settings.server-changed'}, {server}));
  }

  render() {
    const {global} = this.props;
    const {nodes, showNodeList, tryingServer} = this.state;
    const {currency, locale, server, pushNotify} = global;


    return (
      <div className="settings-modal-content">
        <Row className="row">
          <Col offset={2} span={4} className="label-col">
            <FormattedMessage id="settings.currency"/>
          </Col>
          <Col span={18} className="col">
            <Select
              defaultValue={currency}
              showSearch
              style={{width: '100%'}}
              onChange={e => {
                this.currencyChanged(e);
              }}
            >
              {currencies.map(c => (
                <Select.Option key={c.id} value={c.id}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Row className="row">
          <Col offset={2} span={4} className="label-col">
            <FormattedMessage id="settings.locale"/>
          </Col>
          <Col span={18} className="col">
            <Select
              defaultValue={locale}
              showSearch
              style={{width: '100%'}}
              onChange={e => {
                this.localeChanged(e);
              }}
            >
              {locales.map(c => (
                <Select.Option key={c.id} value={c.id}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Row className="row">
          <Col offset={2} span={4} className="label-col">
            <FormattedMessage id="settings.server"/>
          </Col>
          <Col span={18} className="col">
            <span className="serverAddress">{server}</span>
            <Button htmlType="button" type="primary" size="small" shape="circle" onClick={(e) => {
              this.toggleNodeList()
            }}><i className="mi">edit</i></Button>
            {showNodeList &&
            <div className="node-list">
              <div className="node-list-body">
                {nodes.map((n, i) => (
                  <div className="node-list-item" key={i}>
                    <a className={(tryingServer ? 'disabled' : '')} onClick={() => {
                      this.setServer(n)
                    }}>{n}</a>
                  </div>
                ))}
              </div>
            </div>}
          </Col>
        </Row>
        <Row className="row">
          <Col
            offset={6}
            span={18}
            className="col">
            <Switch
              defaultChecked={Boolean(pushNotify)}
              className="push-switch"
              onChange={e => {
                this.pushNotifyChanged(e);
              }}
            />
            <FormattedMessage id="settings.push-notifications"/>
          </Col>
        </Row>

      </div>
    );
  }
}

Settings.propTypes = {
  actions: PropTypes.shape({
    changeCurrency: PropTypes.func.isRequired,
    changeLocale: PropTypes.func.isRequired,
    changePushNotify: PropTypes.func.isRequired
  }).isRequired,
  global: PropTypes.shape({
    currency: PropTypes.string.isRequired,
    locale: PropTypes.string.isRequired,
    server: PropTypes.string.isRequired,
    pushNotify: PropTypes.number.isRequired
  }).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default injectIntl(Settings);
