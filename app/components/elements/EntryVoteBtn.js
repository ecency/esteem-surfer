import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Slider, Popover } from 'antd';
import parseToken from '../../utils/parse-token';
import { vestsToRshares } from '../../utils/conversions';
import { setItem, getItem } from '../../helpers/storage';

import LoginRequired from '../helpers/LoginRequired';

class EntryVoteBtn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sliderVal: 100,
      estimated: 0
    };
  }

  popoverVisibleChanged = v => {
    if (v) {
      const { activeAccount } = this.props;
      const { username } = activeAccount;
      const sliderVal = getItem(`voting_percentage_${username}`, 100);

      const estimated = this.estimate(sliderVal);

      this.setState({ sliderVal, estimated });
    }
  };

  estimate = w => {
    const { activeAccount, dynamicProps } = this.props;
    const { fundRecentClaims, fundRewardBalance, base } = dynamicProps;
    const { accountData: account } = activeAccount;

    const votingPower = account.voting_power;
    const totalVests =
      parseToken(account.vesting_shares) +
      parseToken(account.received_vesting_shares);
    const votePct = w * 100;

    const rShares = vestsToRshares(totalVests, votingPower, votePct);
    return (rShares / fundRecentClaims) * fundRewardBalance * base;
  };

  sliderChanged = sliderVal => {
    const { activeAccount } = this.props;
    const { username } = activeAccount;

    setItem(`voting_percentage_${username}`, sliderVal);

    const estimated = this.estimate(sliderVal);
    this.setState({ sliderVal, estimated });
  };

  render() {
    const { activeAccount } = this.props;
    const { sliderVal, estimated } = this.state;
    const requiredKeys = ['posting'];

    const btn = (
      <a className="btn-vote" role="button" tabIndex="-1">
        <i className="mi">keyboard_arrow_up</i>
      </a>
    );

    if (activeAccount) {
      const popoverContent = (
        <div className="vote-slider-content">
          <div className="estimated">{estimated.toFixed(5)} $</div>
          <div className="percentage">{sliderVal} %</div>

          <Slider
            value={sliderVal}
            step={0.1}
            min={0.1}
            max={100}
            marks={{ 0.1: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }}
            tipFormatter={null}
            onChange={this.sliderChanged}
          />
        </div>
      );

      return (
        <LoginRequired {...this.props} requiredKeys={requiredKeys}>
          <Popover
            onVisibleChange={this.popoverVisibleChanged}
            mouseEnterDelay={2}
            mouseLeaveDelay={2}
            content={popoverContent}
          >
            {btn}
          </Popover>
        </LoginRequired>
      );
    }

    return (
      <LoginRequired {...this.props} requiredKeys={requiredKeys}>
        {btn}
      </LoginRequired>
    );
  }
}

EntryVoteBtn.defaultProps = {
  activeAccount: null
};

EntryVoteBtn.propTypes = {
  dynamicProps: PropTypes.instanceOf(Object).isRequired,
  activeAccount: PropTypes.instanceOf(Object)
};

export default EntryVoteBtn;
