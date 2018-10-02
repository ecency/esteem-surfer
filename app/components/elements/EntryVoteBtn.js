import React, {Component} from 'react';
import PropTypes from "prop-types";
import {Slider, Popover} from 'antd';
import parseToken from '../../utils/parse-token';


import LoginRequired from '../helpers/LoginRequired';

const content = (
  <div style={{width: '300px'}}>
    <Slider defaultValue={30} step={0.1} min={0.1} max={100}
            marks={{0.1: '0.1%', 25: '25%', 50: '50%', 75: '75%', 100: '100%'}}
            tipFormatter={(value) => {
              return `${value}%`
            }}/>

  </div>
);


class EntryVoteBtn extends Component {
  render() {

    const {activeAccount} = this.props;
    const requiredKeys = ['posting'];

    // conversion.js


    if(activeAccount){
      const p = activeAccount.accountData;


      const totalVests = parseToken(p.vesting_shares) + parseToken(p.received_vesting_shares);
    }

    const btn = (
      <a className="btn-vote" role="button" tabIndex="-1">
        <i className="mi">keyboard_arrow_up</i>
      </a>
    );

    if (activeAccount) {
      return (
        <LoginRequired {...this.props} requiredKeys={requiredKeys}>
          <Popover mouseEnterDelay={2} content={content}>
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
  activeAccount: null,
};


EntryVoteBtn.propTypes = {
  activeAccount: PropTypes.instanceOf(Object)
};

export default EntryVoteBtn;
