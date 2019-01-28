import React, { Component } from 'react';

import PropTypes from 'prop-types';

import { FormattedRelative, FormattedMessage } from 'react-intl';

import FormattedCurrency from './FormattedCurrency';

import parseToken from '../../utils/parse-token';
import parseDate from '../../utils/parse-date';
import isEmptyDate from '../../utils/is-empty-date';

class EntryPayoutContent extends Component {
  render() {
    const { entry } = this.props;

    const pendingPayout = parseToken(entry.pending_payout_value);
    const promotedPayout = parseToken(entry.promoted);
    const authorPayout = parseToken(entry.total_payout_value);
    const curationPayout = parseToken(entry.curator_payout_value);
    const payoutDate = parseDate(
      isEmptyDate(entry.last_payout) ? entry.cashout_time : entry.last_payout
    );

    return (
      <div className="payout-popover-content">
        <p>
          <span className="label">
            <FormattedMessage id="entry-payout.potential-payout" />
          </span>
          <span className="value">
            <FormattedCurrency
              {...this.props}
              value={pendingPayout}
              fixAt={3}
            />
          </span>
        </p>
        <p>
          <span className="label">
            <FormattedMessage id="entry-payout.promoted" />
          </span>
          <span className="value">
            <FormattedCurrency
              {...this.props}
              value={promotedPayout}
              fixAt={3}
            />
          </span>
        </p>
        <p>
          <span className="label">
            <FormattedMessage id="entry-payout.author-payout" />
          </span>
          <span className="value">
            <FormattedCurrency {...this.props} value={authorPayout} fixAt={3} />
          </span>
        </p>
        <p>
          <span className="label">
            <FormattedMessage id="entry-payout.curation-payout" />
          </span>
          <span className="value">
            <FormattedCurrency
              {...this.props}
              value={curationPayout}
              fixAt={3}
            />
          </span>
        </p>
        <p>
          <span className="label">
            <FormattedMessage id="entry-payout.payout-date" />
          </span>
          <span className="value">
            <FormattedRelative value={payoutDate} initialNow={Date.now()} />
          </span>
        </p>
      </div>
    );
  }
}

EntryPayoutContent.propTypes = {
  entry: PropTypes.shape({
    pending_payout_value: PropTypes.string.isRequired,
    promoted: PropTypes.string.isRequired,
    total_payout_value: PropTypes.string.isRequired,
    curator_payout_value: PropTypes.string.isRequired,
    last_payout: PropTypes.string.isRequired,
    cashout_time: PropTypes.string.isRequired
  }).isRequired
};

export default EntryPayoutContent;
