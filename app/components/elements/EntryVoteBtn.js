import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Slider, Popover, message } from 'antd';
import parseToken from '../../utils/parse-token';
import { vestsToRshares } from '../../utils/conversions';
import {
  getVotingPercentage,
  setVotingPercentage
} from '../../helpers/storage';

import { getActiveVotes, getContent, vote } from '../../backend/steem-client';

import LoginRequired from '../helpers/LoginRequired';

class EntryVoteBtn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sliderVal: 100,
      estimated: 0,
      showPopover: true,
      voted: false,
      voting: false
    };
  }

  async componentDidMount() {
    this.mounted = true;

    const { activeAccount } = this.props;

    if (!activeAccount) {
      return;
    }

    const { username } = activeAccount;
    const { entry } = this.props;
    const { author, permlink } = entry;

    let votes;
    try {
      votes = await getActiveVotes(author, permlink);
    } catch (e) {
      return;
    }

    const voted = votes.some(v => v.voter === username && v.percent > 0);

    if (this.mounted) {
      this.setState({ voted });
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  clicked = async e => {
    // Prevent trigger vote when clicked on popover slider. Make sure clicked from right element
    const parentNode =
      e.target.tagName === 'path'
        ? e.target.parentNode.parentNode
        : e.target.parentNode;
    if (parentNode.getAttribute('class').indexOf('btn-inner') !== 0) {
      return false;
    }

    const { actions } = this.props;
    const { voted, voting } = this.state;

    if (voting) {
      return false;
    }

    const { global, activeAccount, entry, afterVote } = this.props;
    const { pin } = global;
    const { username } = activeAccount;
    const { author, permlink, id } = entry;

    let weight = 0;

    if (!voted) {
      const perc = getVotingPercentage(username);
      weight = parseInt(perc * 100, 10);
    }

    this.setState({ voting: true });

    try {
      await vote(activeAccount, pin, author, permlink, weight);
    } catch (err) {
      message.error(String(err).substring(0, 30));
    } finally {
      const newEntry = await getContent(author, permlink);
      const { active_votes: votes } = newEntry;

      const isVoted = votes.some(v => v.voter === username && v.percent > 0);

      this.setState({ voting: false, voted: isVoted });

      actions.updateEntry(id, newEntry);

      afterVote(votes);
    }
  };

  popoverVisibleChanged = v => {
    if (v) {
      const { activeAccount } = this.props;
      const { username } = activeAccount;
      const sliderVal = getVotingPercentage(username);

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

    setVotingPercentage(username, sliderVal);

    const estimated = this.estimate(sliderVal);
    this.setState({ sliderVal, estimated });
  };

  render() {
    const { activeAccount } = this.props;
    const { sliderVal, estimated, showPopover, voted, voting } = this.state;
    const requiredKeys = ['posting'];

    const icon = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
      >
        <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
      </svg>
    );

    if (!activeAccount) {
      return (
        <LoginRequired {...this.props} requiredKeys={requiredKeys}>
          <a className="btn-vote" role="button" tabIndex="-1">
            <span className="btn-inner">{icon}</span>
          </a>
        </LoginRequired>
      );
    }

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

    const btnCls = `btn-vote ${voting ? 'in-progress' : ''} ${
      voted ? 'voted' : ''
    }`;

    return (
      <LoginRequired
        {...this.props}
        requiredKeys={requiredKeys}
        onDialogOpen={() => {
          this.setState({ showPopover: false });
        }}
        onDialogClose={() => {
          this.setState({ showPopover: true });
        }}
      >
        {showPopover && !voting ? (
          <a className={btnCls} role="none" onClick={this.clicked}>
            <Popover
              onVisibleChange={this.popoverVisibleChanged}
              mouseEnterDelay={2}
              content={popoverContent}
            >
              <span className="btn-inner">{icon}</span>
            </Popover>
          </a>
        ) : (
          <a className={btnCls} role="none" onClick={this.clicked}>
            <span className="btn-inner">{icon}</span>
          </a>
        )}
      </LoginRequired>
    );
  }
}

EntryVoteBtn.defaultProps = {
  activeAccount: null,
  afterVote: () => {}
};

EntryVoteBtn.propTypes = {
  global: PropTypes.shape({
    pin: PropTypes.string
  }).isRequired,
  dynamicProps: PropTypes.instanceOf(Object).isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  entry: PropTypes.shape({
    id: PropTypes.number.isRequired,
    author: PropTypes.string.isRequired,
    permlink: PropTypes.string.isRequired
  }).isRequired,
  actions: PropTypes.shape({
    updateEntry: PropTypes.func.isRequired
  }).isRequired,
  afterVote: PropTypes.func
};

export default EntryVoteBtn;
