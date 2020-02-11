import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { getContent } from '../../backend/steem-client';

export const makePath = (category, author, permlink, toReplies = false) =>
  `/${category}/@${author}/${permlink}${toReplies ? '#replies' : ''}`;

class EntryLink extends Component {
  goEntry = async () => {
    let { entry } = this.props;
    const { history, actions, toReplies, markAsRead } = this.props;

    if (markAsRead) {
      markAsRead();
    }

    if (!entry) {
      const { author, permlink } = this.props;
      entry = await getContent(author, permlink);
    }

    if (entry) {
      const { category, author, permlink } = entry;
      actions.setVisitingEntry(entry);
      history.push(makePath(category, author, permlink, toReplies));
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
  entry: null,
  toReplies: false,
  markAsRead: null
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
  toReplies: PropTypes.bool,
  actions: PropTypes.shape({
    setVisitingEntry: PropTypes.func.isRequired
  }).isRequired,
  markAsRead: PropTypes.func
};

export default EntryLink;
