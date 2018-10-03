import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Slider, Popover, message} from 'antd';
import parseToken from '../../utils/parse-token';
import {vestsToRshares} from '../../utils/conversions';
import {setItem, getItem} from '../../helpers/storage';

import {getActiveVotes, vote} from '../../backend/steem-client';

import LoginRequired from '../helpers/LoginRequired';

const setPercentage = (username, val) => {
  setItem(`voting_percentage_${username}`, val);
};

const getPercentage = username => getItem(`voting_percentage_${username}`, 100);

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
  };


  async componentDidMount() {
    const {activeAccount} = this.props;

    if (!activeAccount) {
      return
    }

    const {username} = activeAccount;
    const {entry} = this.props;
    const {author, permlink} = entry;

    let votes;
    try {
      votes = await getActiveVotes(author, permlink);
    } catch (e) {
      return;
    }

    const voted = votes.some(vote => vote.voter === username && vote.percent > 0);

    this.setState({voted});
  }

  clicked = async (e) => {

    // Make sure clicked from right element
    if (e.target.parentNode.getAttribute('class') !== 'btn-inner') {
      return false;
    }

    const {voted, voting} = this.state;

    if (voting) {
      return false;
    }

    const {global, activeAccount, entry} = this.props;
    const {pin} = global;
    const {username} = activeAccount;
    const {author, permlink} = entry;


    let weight = 0;

    if (!voted) {
      const perc = getPercentage(username);
      weight = parseInt(perc * 100, 10);
    }

    this.setState({voting: true});

    try {
      await vote(activeAccount, pin, author, permlink, weight);
    } catch (e) {
      message.error(String(e))
    } finally {
      const votes = await getActiveVotes(author, permlink);
      const votedAfter = votes.some(vote => vote.voter === username && vote.percent > 0);
      this.setState({voting: false, voted: votedAfter});
    }
  };

  popoverVisibleChanged = v => {
    if (v) {
      const {activeAccount} = this.props;
      const {username} = activeAccount;
      const sliderVal = getPercentage(username);

      const estimated = this.estimate(sliderVal);

      this.setState({sliderVal, estimated});
    }
  };

  estimate = w => {
    const {activeAccount, dynamicProps} = this.props;
    const {fundRecentClaims, fundRewardBalance, base} = dynamicProps;
    const {accountData: account} = activeAccount;

    const votingPower = account.voting_power;
    const totalVests =
      parseToken(account.vesting_shares) +
      parseToken(account.received_vesting_shares);
    const votePct = w * 100;

    const rShares = vestsToRshares(totalVests, votingPower, votePct);
    return (rShares / fundRecentClaims) * fundRewardBalance * base;
  };

  sliderChanged = sliderVal => {
    const {activeAccount} = this.props;
    const {username} = activeAccount;

    setPercentage(username, sliderVal);

    const estimated = this.estimate(sliderVal);
    this.setState({sliderVal, estimated});
  };

  render() {
    const {activeAccount} = this.props;
    const {sliderVal, estimated, showPopover, voted, voting} = this.state;
    const requiredKeys = ['posting'];


    if (!activeAccount) {
      return (
        <LoginRequired {...this.props} requiredKeys={requiredKeys}>
          <a className="btn-vote" role="button" tabIndex="-1">
            <span className="icon"><i className="mi">keyboard_arrow_up</i></span>
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
          marks={{0.1: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%'}}
          tipFormatter={null}
          onChange={this.sliderChanged}
        />
      </div>
    );

    const btnCls = `btn-vote ${voting ? 'in-progress' : ''} ${voted ? 'voted' : ''}`;

    return (
      <LoginRequired
        {...this.props}
        requiredKeys={requiredKeys}
        onDialogOpen={() => {
          this.setState({showPopover: false});
        }}
        onDialogClose={() => {
          this.setState({showPopover: true});
        }}
      >
        {showPopover ? (
          <a className={btnCls} role="button" tabIndex="-1" onClick={this.clicked}>
            <Popover
              onVisibleChange={this.popoverVisibleChanged}
              mouseEnterDelay={2}
              content={popoverContent}
            >
              <span className="btn-inner"><i className="mi">keyboard_arrow_up</i></span>
            </Popover>
          </a>
        ) : (
          <a className={btnCls} role="button" tabIndex="-1" onClick={this.clicked}>
            <span className="btn-inner"><i className="mi">keyboard_arrow_up</i></span>
          </a>
        )}
      </LoginRequired>
    );
  }
}

EntryVoteBtn.defaultProps = {
  activeAccount: null
};

EntryVoteBtn.propTypes = {
  global: PropTypes.shape({
    pin: PropTypes.string
  }).isRequired,
  dynamicProps: PropTypes.instanceOf(Object).isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  entry: PropTypes.shape({
    author: PropTypes.string.isRequired,
    permlink: PropTypes.string.isRequired
  }).isRequired
};

export default EntryVoteBtn;
