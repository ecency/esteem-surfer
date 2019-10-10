/*
eslint-disable react/no-multi-comp
*/

import React, { Fragment, PureComponent } from 'react';

import PropTypes from 'prop-types';

import { FormattedNumber, FormattedMessage } from 'react-intl';

import { Modal, Slider, Button } from 'antd';

import SliderTooltip from '../elements/SliderTooltip';

class EstmPurchase extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      curr: 'STEEM',
      amount: 250
    };
  }

  amountChanged = amount => {
    this.setState({ amount });
  };

  selectCurr = curr => {
    this.setState({ curr });
  };

  go = () => {
    const { history, username, actions } = this.props;
    const { curr, amount } = this.state;

    actions.tempSet({
      type: 'transfer',
      asset: curr,
      amount,
      to: 'esteem.app',
      memo: 'estm-purchase'
    });

    const newLoc = `/@${username}/transfer/${curr}`;
    history.push(newLoc);
  };

  render() {
    const sliderMin = 10;
    const sliderMax = 10000;
    const { marketData } = this.props;
    const { amount, curr } = this.state;

    if (!marketData) {
      return;
    }

    const sliderMarks = {
      10: '10',
      500: '500',
      1000: '1000',
      2000: '2000',
      3000: '3000',
      4000: '4000',
      5000: '5000',
      6000: '6000',
      7000: '7000',
      8000: '8000',
      9000: '9000',
      10000: '10000'
    };

    const rates = {
      SBD: marketData.sbd.quotes.usd.price,
      STEEM: marketData.steem.quotes.usd.price
    };

    const sliderPercentage =
      amount === sliderMin ? 0 : Math.ceil((amount / sliderMax) * 100);
    const rate = rates[curr];
    const usdAmount = amount * rate;
    const estmAmount = usdAmount / 0.002;

    return (
      <div className="estm-purchase-dialog-content">
        <div className="curr-select">
          <Button.Group>
            <Button
              {...{ type: curr === 'STEEM' ? 'primary' : '' }}
              onClick={() => {
                this.selectCurr('STEEM');
              }}
            >
              STEEM
            </Button>
            <Button
              {...{ type: curr === 'SBD' ? 'primary' : '' }}
              onClick={() => {
                this.selectCurr('SBD');
              }}
            >
              SBD
            </Button>
          </Button.Group>
        </div>

        <div className="slider-area">
          <SliderTooltip
            percentage={sliderPercentage}
            value={
              <Fragment>
                {amount} {curr}
                <span className="slider-price">
                  &nbsp; {usdAmount.toFixed(3)} {'$'}
                </span>
              </Fragment>
            }
          />
          <Slider
            step={1}
            min={sliderMin}
            max={sliderMax}
            tooltipVisible={false}
            value={amount}
            onChange={this.amountChanged}
            marks={sliderMarks}
          />
          <div className="clearfix" />
          <div className="estm-amount">
            <FormattedNumber value={estmAmount} /> {'ESTM'}
          </div>
          <div className="purchase-button">
            <Button type="primary" onClick={this.go}>
              <FormattedMessage id="estm-purchase.purchase" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

EstmPurchase.defaultProps = {
  activeAccount: null,
  marketData: null
};

EstmPurchase.propTypes = {
  username: PropTypes.string.isRequired,
  dynamicProps: PropTypes.shape({
    steemPerMVests: PropTypes.number.isRequired
  }).isRequired,
  marketData: PropTypes.instanceOf(Object),
  activeAccount: PropTypes.instanceOf(Object),
  intl: PropTypes.instanceOf(Object).isRequired,
  history: PropTypes.instanceOf(Object).isRequired,
  actions: PropTypes.shape({
    tempSet: PropTypes.func.isRequired
  }).isRequired
};

export default class EstmPurchaseModal extends PureComponent {
  render() {
    const { intl, visible, onCancel } = this.props;

    return (
      <Modal
        visible={visible}
        footer={false}
        width="850px"
        onCancel={onCancel}
        destroyOnClose
        centered
        title={intl.formatMessage({ id: 'estm-purchase.title' })}
      >
        <EstmPurchase {...this.props} />
      </Modal>
    );
  }
}

EstmPurchaseModal.defaultProps = {
  onCancel: () => {}
};

EstmPurchaseModal.propTypes = {
  intl: PropTypes.instanceOf(Object).isRequired,
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func
};
