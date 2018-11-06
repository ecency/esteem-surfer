import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { getContent } from '../../backend/steem-client';

export const makePath = (category, author, permlink) =>
  `/${category}/@${author}/${permlink}`;

class EntryLink extends Component {
  goEntry = async () => {
    let { entry } = this.props;
    const { history, actions } = this.props;

    if (!entry) {
      const { author, permlink } = this.props;
      entry = await getContent(author, permlink);
    }

    if (entry) {
      const { category, author, permlink } = entry;
      actions.setVisitingEntry(entry);
      history.push(makePath(category, author, permlink));
    }
  };

  render() {
    const { children } = this.props;

    return React.cloneElement(children, {
      onClick: this.goEntry
    });
  }
}

EntryLink.defaultProps = {
  entry: null
};

EntryLink.propTypes = {
  children: PropTypes.element.isRequired,
  history: PropTypes.instanceOf(Object).isRequired,
  entry: PropTypes.shape({
    category: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    permlink: PropTypes.string.isRequired
  }),
  author: PropTypes.string.isRequired,
  permlink: PropTypes.string.isRequired,
  actions: PropTypes.shape({
    setVisitingEntry: PropTypes.func.isRequired
  }).isRequired
};

export default EntryLink;
