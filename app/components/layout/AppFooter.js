import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Tooltip } from 'antd';

import { version } from '../../../package.json';

import { votingPower, rcPower } from '../../utils/manabar';

export const powerCssPercentage = p => {
  if (p >= 100) {
    return '100%';
  }

  if (p <= 10) return '10%';

  return `${String(p).split('')[0]}0%`;
};

class AppFooter extends Component {
  render() {
    const { activeAccount } = this.props;

    let vp;
    let rc;

    if (activeAccount) {
      const { accountData } = activeAccount;
      if (accountData) {
        vp = votingPower(accountData).toFixed(1);
        rc = rcPower(accountData).toFixed(1);
      }
    }

    return (
      <div className="app-footer">
        <div className="left-side">
          {vp && (
            <Tooltip title="Voting Power" mouseEnterDelay={2}>
              <div className="voting-power">
                <span className="first-line">
                  <span className="first-line-label">VP</span>
                  <span>{vp}%</span>
                </span>
                <span className="power-line">
                  <span
                    className="power-line-inner"
                    style={{ width: powerCssPercentage(vp) }}
                  />
                </span>
              </div>
            </Tooltip>
          )}
          {rc && (
            <Tooltip title="Resource Credits" mouseEnterDelay={2}>
              <div className="resource-credits">
                <span className="first-line">
                  <span className="first-line-label">RC</span>
                  <span>{rc}%</span>
                </span>
                <span className="power-line">
                  <span
                    className="power-line-inner"
                    style={{ width: powerCssPercentage(rc) }}
                  />
                </span>
              </div>
            </Tooltip>
          )}
        </div>

        <div className="right-side">
          <a>FAQ</a>
          <a>About</a>
          <a className="version">{version}</a>
        </div>
      </div>
    );
  }
}

AppFooter.defaultProps = {
  activeAccount: null
};

AppFooter.propTypes = {
  activeAccount: PropTypes.instanceOf(Object)
};

export default AppFooter;
