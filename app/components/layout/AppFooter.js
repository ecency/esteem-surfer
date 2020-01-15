import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import { Tooltip } from 'antd';

import { FormattedMessage } from 'react-intl';

import isEqual from 'react-fast-compare';

import { releasePost, version } from '../../../package.json';

import { votingPower, rcPower } from '../../utils/manabar';

import { battery } from '../../svg';

import EntryLink from '../helpers/EntryLink';

export const powerImg = power => {
  if (power >= 100) {
    return 100;
  }

  if (power <= 10) return 10;

  return parseInt(`${String(power).split('')[0]}0`, 10);
};

class AppFooter extends Component {
  shouldComponentUpdate(nextProps) {
    const { activeAccount } = this.props;

    return !isEqual(activeAccount, nextProps.activeAccount);
  }

  render() {
    const { activeAccount } = this.props;

    let showPower = false;
    let vp;
    let rc;

    if (activeAccount) {
      const { accountData } = activeAccount;
      if (accountData) {
        try {
          vp = votingPower(accountData).toFixed(2);
          rc = rcPower(accountData).toFixed(2);
          showPower = true;
        } catch (e) {
          showPower = false;
        }
      }
    }

    const [, verAuthor, verPermlink] = releasePost.split('/');

    return (
      <div className="app-footer">
        <div className="left-side">
          {showPower && (
            <Fragment>
              <Tooltip title="Voting Power" mouseEnterDelay={1}>
                <div className="vp">
                  <div className="battery-img">{battery[powerImg(vp)]}</div>
                  {vp}%
                </div>
              </Tooltip>
              <div className="separator">•</div>
              <Tooltip title="Resource Credits" mouseEnterDelay={1}>
                <div className="rc">
                  <strong>RC:</strong> {rc}%
                </div>
              </Tooltip>
            </Fragment>
          )}
        </div>

        <div className="right-side">
          <EntryLink
            {...this.props}
            author="good-karma"
            permlink="esteem-faq-updated-e2baacf0a8475"
          >
            <a className="faq">
              <FormattedMessage id="footer.faq" />
            </a>
          </EntryLink>
          <a className="about" href="https://esteem.app" target="_external">
            <FormattedMessage id="footer.about" />
          </a>
          <EntryLink
            {...this.props}
            author={verAuthor.replace('@', '')}
            permlink={verPermlink}
          >
            <a className="version">{version}</a>
          </EntryLink>
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
