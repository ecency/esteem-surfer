import React, { Component } from 'react';

import PropTypes from 'prop-types';

import { Row, Col, Select, Switch, Input, Button, message } from 'antd';
import { FormattedMessage } from 'react-intl';

import { Client } from '@esteemapp/dhive';

import moment from 'moment';

import currencies from '../../constants/currencies';
import defaults from '../../constants/defaults';

import { locales } from '../../locales/index';

import { getCurrencyRate, getNodes } from '../../backend/esteem-client';

class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      servers: [],
      showServerList: false,
      connectingServer: false
    };
  }

  componentDidMount() {
    const { intl } = this.props;

    getNodes()
      .then(resp => {
        this.setState({ servers: resp });
        return resp;
      })
      .catch(() => {
        message.error(
          intl.formatMessage({ id: 'settings.server-list-fetch-error' })
        );
      });
  }

  toggleServerList() {
    const { showServerList } = this.state;
    this.setState({ showServerList: !showServerList });
  }

  async setCurrency(e) {
    const { actions, intl } = this.props;
    const { changeCurrency } = actions;

    let rate;

    try {
      rate = await getCurrencyRate(e);
    } catch (err) {
      message.error(
        intl.formatMessage({ id: 'settings.currency-fetch-error' }, { cur: e })
      );
      return;
    }

    changeCurrency(e, rate);
    message.success(intl.formatMessage({ id: 'settings.currency-changed' }));
  }

  setLocale(e) {
    const { actions, intl } = this.props;
    const { changeLocale } = actions;
    changeLocale(e);
    moment.locale(e);
    message.success(intl.formatMessage({ id: 'settings.locale-changed' }));
  }

  setPushNotify(e) {
    const { actions, intl } = this.props;
    const { changePushNotify } = actions;
    changePushNotify(Number(e));

    if (e) {
      message.success(
        intl.formatMessage({ id: 'settings.push-notify-enabled' })
      );
    } else {
      message.info(intl.formatMessage({ id: 'settings.push-notify-disabled' }));
    }
  }

  setCustomServer() {
    const el = document.querySelector('#txt-custom-server');
    const address = el.value.trim();
    if (address === '') {
      el.focus();
      return;
    }
    this.setServer(address);
  }

  async setServer(server) {
    const { actions, intl } = this.props;
    const selectedServer = defaults.servers;

    if (!/^((http|https):\/\/)/.test(server)) {
      message.error(
        intl.formatMessage({ id: 'settings.server-invalid-address' })
      );
      return false;
    }
    this.setState({ connectingServer: true });
    selectedServer.unshift(server);

    const client = new Client(selectedServer, { timeout: 5000 });

    const hideMsg = message.loading(
      intl.formatMessage({ id: 'settings.server-connecting' }, { server }),
      0
    );

    let serverResp;
    try {
      serverResp = await client.database.getDynamicGlobalProperties();
    } catch (e) {
      message.error(
        intl.formatMessage({ id: 'settings.server-connect-error' }, { server })
      );
      return;
    } finally {
      hideMsg();
      this.setState({ connectingServer: false });
    }

    const localTime = new Date(new Date().toISOString().split('.')[0]);
    const serverTime = new Date(serverResp.time);
    const isAlive = localTime - serverTime < 15000;

    if (!isAlive) {
      message.error(
        intl.formatMessage({ id: 'settings.server-timeout-error' }, { server })
      );
      return;
    }

    actions.changeServer(server);
    message.success(
      intl.formatMessage({ id: 'settings.server-changed' }, { server })
    );
  }

  render() {
    const { global, intl } = this.props;
    const { servers, showServerList, connectingServer } = this.state;
    const { currency, locale, server, pushNotify } = global;

    return (
      <div className="settings-dialog-content">
        <Row className="row">
          <Col offset={2} span={4} className="label-col">
            <FormattedMessage id="settings.currency" />
          </Col>
          <Col span={18} className="col">
            <Select
              defaultValue={currency}
              showSearch
              style={{ width: '100%' }}
              onChange={e => {
                this.setCurrency(e);
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
            <FormattedMessage id="settings.locale" />
          </Col>
          <Col span={18} className="col">
            <Select
              defaultValue={locale}
              showSearch
              style={{ width: '100%' }}
              onChange={e => {
                this.setLocale(e);
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
            <FormattedMessage id="settings.server" />
          </Col>
          <Col span={18} className="col">
            <span className="serverAddress">{server}</span>
            <Button
              id="btn-toggle-servers"
              htmlType="button"
              type="primary"
              size="small"
              shape="circle"
              onClick={() => {
                this.toggleServerList();
              }}
            >
              <i className="mi">edit</i>
            </Button>
            {showServerList && (
              <div className="node-list">
                <div className="node-list-body">
                  {servers.map(n => (
                    <div className="node-list-item" key={n}>
                      <a
                        role="none"
                        className={connectingServer ? 'disabled' : ''}
                        onClick={() => {
                          this.setServer(n);
                        }}
                      >
                        {n}
                      </a>
                    </div>
                  ))}
                </div>

                <div className="node-list-footer">
                  <Input.Group>
                    <Col span={18}>
                      <Input
                        size="small"
                        id="txt-custom-server"
                        placeholder={intl.formatMessage(
                          { id: 'settings.server-custom-address' },
                          { server }
                        )}
                      />
                    </Col>
                    <Col span={3}>
                      <Button
                        type="primary"
                        size="small"
                        disabled={connectingServer}
                        shape="circle"
                        onClick={() => {
                          this.setCustomServer();
                        }}
                      >
                        <i className="mi" style={{ fontSize: 20 }}>
                          chevron_right
                        </i>
                      </Button>
                    </Col>
                  </Input.Group>
                </div>
              </div>
            )}
          </Col>
        </Row>
        <Row className="row">
          <Col offset={6} span={18} className="col">
            <Switch
              defaultChecked={Boolean(pushNotify)}
              className="push-switch"
              onChange={e => {
                this.setPushNotify(e);
              }}
            />
            <FormattedMessage id="settings.push-notifications" />
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
    changePushNotify: PropTypes.func.isRequired,
    changeServer: PropTypes.func.isRequired
  }).isRequired,
  global: PropTypes.shape({
    currency: PropTypes.string.isRequired,
    locale: PropTypes.string.isRequired,
    server: PropTypes.string.isRequired,
    pushNotify: PropTypes.number.isRequired
  }).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default Settings;
