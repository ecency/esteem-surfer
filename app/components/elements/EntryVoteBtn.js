import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Slider, Popover, message } from 'antd';
import parseToken from '../../utils/parse-token';
import { vestsToRshares } from '../../utils/conversions';
import {
  getVotingPercentage,
  setVotingPercentage
} from '../../helpers/storage';

import { getContent, vote } from '../../backend/steem-client';

import LoginRequired from '../helpers/LoginRequired';

import { chevronUp } from '../../svg';

class EntryVoteBtn extends Component {
  constructor(props) {
    super(props);

    const { entry } = this.props;

    this.state = {
      sliderVal: 100,
      estimated: 0,
      showPopover: true,
      voting: false,
      activeVotes: entry.active_votes
    };
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  isVoted = () => {
    const { activeAccount } = this.props;

    if (!activeAccount) {
      return false;
    }

    const { activeVotes } = this.state;

    return activeVotes.some(
      v => v.voter === activeAccount.username && v.percent > 0
    );
  };

  clicked = async e => {
    // Prevent trigger vote when clicked on popover slider. Make sure clicked from right element
    const parentNode =
      e.target.tagName === 'path'
        ? e.target.parentNode.parentNode
        : e.target.parentNode;
    if (
      !parentNode ||
      parentNode.getAttribute('class').indexOf('btn-inner') !== 0
    ) {
      return false;
    }

    const { actions, activeAccount, entry } = this.props;
    const { voting } = this.state;

    if (voting) {
      return false;
    }

    const { global, afterVote } = this.props;
    const { pin } = global;
    const { username } = activeAccount;
    const { author, permlink } = entry;

    let weight = 0;

    if (!this.isVoted()) {
      const perc = getVotingPercentage(username);
      weight = parseInt(perc * 100, 10);
    }

    this.setState({ voting: true });

    try {
      await vote(activeAccount, pin, author, permlink, weight);
    } catch (err) {
      message.error(String(err).substring(0, 30));
    } finally {
      let newEntry = await getContent(author, permlink);

      if (entry.reblogged_by) {
        newEntry = Object.assign({}, newEntry, {
          reblogged_by: entry.reblogged_by
        });
      }

      const { active_votes: votes } = newEntry;

      if (this.mounted) {
        this.setState({ voting: false, activeVotes: votes });
      }

      actions.updateEntry(newEntry);
      afterVote(newEntry);
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
    const { fundRecentClaims, fundRewardBalance, base, quote } = dynamicProps;
    const { accountData: account } = activeAccount;

    const votingPower = account.voting_power;
    const totalVests =
      parseToken(account.vesting_shares) +
      parseToken(account.received_vesting_shares) -
      parseToken(account.delegated_vesting_shares);
    const votePct = w * 100;

    const rShares = vestsToRshares(totalVests, votingPower, votePct);
    return (rShares / fundRecentClaims) * fundRewardBalance * (base / quote);
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
    const { sliderVal, estimated, showPopover, voting } = this.state;
    const requiredKeys = ['posting'];

    const voted = this.isVoted();

    if (!activeAccount) {
      return (
        <LoginRequired {...this.props} requiredKeys={requiredKeys}>
          <a className="btn-vote" role="button" tabIndex="-1">
            <span className="btn-inner">{chevronUp}</span>
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
              <span className="btn-inner">{chevronUp}</span>
            </Popover>
          </a>
        ) : (
          <a className={btnCls} role="none" onClick={this.clicked}>
            <span className="btn-inner">{chevronUp}</span>
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
    author: PropTypes.string.isRequired,
    permlink: PropTypes.string.isRequired,
    active_votes: PropTypes.arrayOf(Object)
  }).isRequired,
  actions: PropTypes.shape({
    updateEntry: PropTypes.func.isRequired
  }).isRequired,
  afterVote: PropTypes.func
};

export default EntryVoteBtn;
