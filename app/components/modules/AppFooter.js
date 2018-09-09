// @flow
import React, { Component } from 'react';
import { version } from '../../../package.json';

import batteryLogo from '../../img/ic_battery_60_48px.svg';

type Props = {};

export default class AppFooter extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className="app-footer">
        <div className="voting-power">
          <div className="battery">
            <img src={batteryLogo} alt="Voting Power" />
          </div>
        </div>
        <div className="right-menu">
          <a>FAQ</a>
          <a>About</a>
          <a className="version">{version}</a>
        </div>
      </div>
    );
  }
}
