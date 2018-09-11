import React, { Component } from 'react';
import { FormattedRelative, FormattedMessage } from 'react-intl';
import { Popover } from 'antd';

import parseMoney from '../../utils/parse-money';
import parseDate from '../../utils/parse-date';
import currencySymbol from '../../utils/currency-symbol';

type Props = {
  content: {},
  children: React.Node
};

export default class PayoutInfo extends Component<Props> {
  props: Props;

  render() {
    const { content, children } = this.props;

    const currency = 'usd';
    const currencyRate = 1;

    const pendingPayout = (
      parseMoney(content.pending_payout_value) * currencyRate
    ).toFixed(3);
    const promotedPayout = (
      parseMoney(content.promoted) * currencyRate
    ).toFixed(3);
    const authorPayout = parseMoney(content.total_payout_value) * currencyRate;
    const curationPayout =
      parseMoney(content.curator_payout_value) * currencyRate;
    const payoutDate = parseDate(
      content.last_payout === '1970-01-01T00:00:00'
        ? content.cashout_time
        : content.last_payout
    );
    const curSymbol = currencySymbol(currency);

    const popoverContent = (
      <div className="payout-popover-content">
        <p>
          <span className="label">
            <FormattedMessage id="payout-info.potential-payout" />
          </span>
          <span className="value">
            {curSymbol} {pendingPayout}
          </span>
        </p>
        <p>
          <span className="label">
            <FormattedMessage id="payout-info.promoted" />
          </span>
          <span className="value">
            {curSymbol} {promotedPayout}
          </span>
        </p>
        <p>
          <span className="label">
            <FormattedMessage id="payout-info.author-payout" />
          </span>
          <span className="value">
            {curSymbol} {authorPayout}
          </span>
        </p>
        <p>
          <span className="label">
            <FormattedMessage id="payout-info.curation-payout" />
          </span>
          <span className="value">
            {curSymbol} {curationPayout}
          </span>
        </p>
        <p>
          <span className="label">
            <FormattedMessage id="payout-info.payout-date" />
          </span>
          <span className="value">
            <FormattedRelative value={payoutDate} />
          </span>
        </p>
      </div>
    );

    return (
      <Popover content={popoverContent} placement="bottom">
        {children}
      </Popover>
    );
  }
}
