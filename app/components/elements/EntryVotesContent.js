import React, { Component } from 'react';

import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';

import FormattedCurrency from './FormattedCurrency';

class EntryVotesContent extends Component {
  render() {
    const { votes } = this.props;

    const popoverVotes = votes.slice(0, 10);
    const moreCount = votes.length - 10;

    const popoverChildren = popoverVotes.map(v => (
      <p key={v.voter}>
        <span key="voter" className="voter">
          {v.voter}
        </span>
        <span key="percent" className="percent">
          {v.percent.toFixed(1)}
          {'%'}
        </span>
        <span key="reward" className="reward">
          <FormattedCurrency {...this.props} value={v.reward} fixAt={3} />
        </span>
      </p>
    ));

    if (moreCount > 0) {
      popoverChildren.push(
        <p key="more" className="more">
          <FormattedMessage id="entry-votes.n-more" values={{ n: moreCount }} />
        </p>
      );
    }

    return <div className="votes-popover-content">{popoverChildren}</div>;
  }
}

EntryVotesContent.propTypes = {
  votes: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default EntryVotesContent;
