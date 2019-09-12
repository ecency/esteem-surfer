/*
eslint-disable react/no-multi-comp, jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
*/

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Slider, Popover, message } from 'antd';
import parseToken from '../../utils/parse-token';
import { vestsToRshares } from '../../utils/conversions';
import {
  getVotingPercentage,
  setVotingPercentage,
  getVotingPercentageNeg,
  setVotingPercentageNeg
} from '../../helpers/storage';

import { getContent, vote } from '../../backend/steem-client';

import LoginRequired from '../helpers/LoginRequired';

import { chevronUp } from '../../svg';

class Btn extends Component {
  render() {
    const {
      clsPrefix,
      voted,
      voting,
      disabled,
      showPopover,
      popoverContent,
      onClick,
      onLoginDialogOpen,
      onLoginDialogClose,
      onPopoverVisibleChanged
    } = this.props;

    const btnCls = `${clsPrefix} ${voting ? 'in-progress' : ''} ${
      voted ? 'voted' : ''
    } ${disabled ? 'disabled' : ''}`;

    return (
      <LoginRequired
        {...this.props}
        requiredKeys={['posting']}
        onDialogOpen={onLoginDialogOpen}
        onDialogClose={onLoginDialogClose}
      >
        {showPopover && !voting ? (
          <a className={btnCls} role="none" onClick={onClick}>
            <Popover
              onVisibleChange={onPopoverVisibleChanged}
              mouseEnterDelay={2}
              content={popoverContent}
            >
              <span className="btn-inner">{chevronUp}</span>
            </Popover>
          </a>
        ) : (
          <a className={btnCls} role="none" onClick={onClick}>
            <span className="btn-inner">{chevronUp}</span>
          </a>
        )}
      </LoginRequired>
    );
  }
}

Btn.defaultProps = {
  voted: false,
  voting: false,
  disabled: false,
  showPopover: false,
  popoverContent: null,
  onClick: () => {},
  onLoginDialogOpen: () => {},
  onLoginDialogClose: () => {},
  onPopoverVisibleChanged: () => {}
};

Btn.propTypes = {
  clsPrefix: PropTypes.string.isRequired,
  voted: PropTypes.bool,
  voting: PropTypes.bool,
  disabled: PropTypes.bool,
  showPopover: PropTypes.bool,
  popoverContent: PropTypes.node,
  onClick: PropTypes.func,
  onLoginDialogOpen: PropTypes.func,
  onLoginDialogClose: PropTypes.func,
  onPopoverVisibleChanged: PropTypes.func
};

class EntryVoteBtn extends Component {
  constructor(props) {
    super(props);

    const { entry } = this.props;

    this.state = {
      sliderVal: 100,
      estimated: 0,
      showPopover: true,
      upVoting: false,
      downVoting: false,
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

    const upVoted = activeVotes.some(
      v => v.voter === activeAccount.username && v.percent > 0
    );

    const downVoted = activeVotes.some(
      v => v.voter === activeAccount.username && v.percent < 0
    );

    return { upVoted, downVoted };
  };

  upVote = e => {
    const { activeAccount } = this.props;
    const { upVoted } = this.isVoted();

    let weight = 0;

    if (!upVoted) {
      const perc = getVotingPercentage(activeAccount.username, 100);
      weight = parseInt(perc * 100, 10);
    }

    const { upVoting } = this.state;
    if (upVoting) {
      return false;
    }

    this.setState({ upVoting: true });
    return this.vote(e, weight).finally(() => {
      this.setState({ upVoting: false });
    });
  };

  downVote = e => {
    const { activeAccount } = this.props;
    const { downVoted } = this.isVoted();

    let weight = 0;

    if (!downVoted) {
      const perc = getVotingPercentageNeg(activeAccount.username, 100);
      weight = parseInt(perc * 100, 10) * -1;
    }

    const { downVoting } = this.state;
    if (downVoting) {
      return false;
    }

    this.setState({ downVoting: true });
    return this.vote(e, weight).finally(() => {
      this.setState({ downVoting: false });
    });
  };

  vote = async (e, weight) => {
    // Prevent trigger vote when clicked on popover slider. Make sure clicked from right element
    const parentNode =
      e.target.tagName === 'path'
        ? e.target.parentNode.parentNode
        : e.target.parentNode;

    if (
      !(
        parentNode &&
        parentNode.getAttribute('class') &&
        parentNode.getAttribute('class').indexOf('btn-inner') === 0
      )
    ) {
      return false;
    }

    const { actions, activeAccount, entry } = this.props;

    const { global, afterVote } = this.props;
    const { pin } = global;
    const { author, permlink } = entry;

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
        this.setState({ activeVotes: votes });
      }

      actions.updateEntry(newEntry);
      afterVote(newEntry);
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

  render() {
    const { activeAccount } = this.props;
    const {
      sliderVal,
      estimated,
      showPopover,
      upVoting,
      downVoting
    } = this.state;
    const { upVoted, downVoted } = this.isVoted();

    if (!activeAccount) {
      return (
        <div className="vote-btns">
          <Btn {...this.props} clsPrefix="btn-up-vote" />
          <Btn {...this.props} clsPrefix="btn-down-vote" />
        </div>
      );
    }

    const popoverContentUpVote = (
      <div
        className="vote-slider-content"
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="estimated">{estimated.toFixed(5)} $</div>
        <div className="percentage">{sliderVal} %</div>
        <Slider
          value={sliderVal}
          step={0.1}
          min={0.1}
          max={100}
          marks={{ 0.1: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }}
          tipFormatter={null}
          onChange={v => {
            setVotingPercentage(activeAccount.username, v);
            const es = this.estimate(v);
            this.setState({ sliderVal: v, estimated: es });
          }}
        />
      </div>
    );

    const popoverContentDownVote = (
      <div
        className="vote-slider-content"
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="estimated">-{estimated.toFixed(5)} $</div>
        <div className="percentage">-{sliderVal} %</div>
        <Slider
          value={sliderVal}
          step={0.1}
          min={0.1}
          max={100}
          marks={{
            0.1: '0%',
            25: '-25%',
            50: '-50%',
            75: '-75%',
            100: '-100%'
          }}
          tipFormatter={null}
          onChange={v => {
            setVotingPercentageNeg(activeAccount.username, v);
            const es = this.estimate(v);
            this.setState({ sliderVal: v, estimated: es });
          }}
        />
      </div>
    );

    return (
      <div className="vote-btns">
        <Btn
          {...this.props}
          clsPrefix="btn-up-vote"
          voted={upVoted}
          voting={upVoting}
          disabled={downVoting}
          showPopover={showPopover}
          popoverContent={popoverContentUpVote}
          onClick={this.upVote}
          onLoginDialogOpen={() => {
            this.setState({ showPopover: false });
          }}
          onLoginDialogClose={() => {
            this.setState({ showPopover: true });
          }}
          onPopoverVisibleChanged={v => {
            if (v) {
              const sv = getVotingPercentage(activeAccount.username, 100);
              const es = this.estimate(sv);
              this.setState({ sliderVal: sv, estimated: es });
            }
          }}
        />
        <Btn
          {...this.props}
          clsPrefix="btn-down-vote"
          voted={downVoted}
          voting={downVoting}
          disabled={upVoting}
          showPopover={showPopover}
          popoverContent={popoverContentDownVote}
          onClick={this.downVote}
          onLoginDialogOpen={() => {
            this.setState({ showPopover: false });
          }}
          onLoginDialogClose={() => {
            this.setState({ showPopover: true });
          }}
          onPopoverVisibleChanged={v => {
            if (v) {
              const sv = getVotingPercentageNeg(activeAccount.username, 100);
              const es = this.estimate(sv);
              this.setState({ sliderVal: sv, estimated: es });
            }
          }}
        />
      </div>
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
