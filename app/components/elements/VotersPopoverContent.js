import React, { Component } from 'react';

import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';

import FormattedCurrency from './FormattedCurrency';

class VotersPopoverContent extends Component {
  render() {
    const { votes } = this.props;

    const popoverVotes = votes.slice(0, 10);
    const moreCount = votes.length - 10;

    const popoverChildren = popoverVotes.map(v => (
      <p key={v.voter}>
        <span className="voter">{v.voter}</span>
        <span className="percent">{v.percent.toFixed(1)}</span>
        <span className="reward">
          <FormattedCurrency {...this.props} value={v.reward} />
        </span>
      </p>
    ));

    if (moreCount > 0) {
      popoverChildren.push(
        <p key="more" className="more">
          <FormattedMessage id="voters-info.n-more" values={{ n: moreCount }} />
        </p>
      );
    }

    return <div className="voters-info-popover-content">{popoverChildren}</div>;
  }
}

VotersPopoverContent.propTypes = {
  votes: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default VotersPopoverContent;
