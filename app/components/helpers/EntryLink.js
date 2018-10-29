import React, {Component} from 'react';
import PropTypes from 'prop-types';

class EntryLink extends Component {
  goEntry = () => {
    const {entry, history, actions} = this.props;

    const {category, author, permlink} = entry;

    actions.setVisitingEntry(entry);

    history.push(`/${category}/@${author}/${permlink}`);
  };

  render() {
    const {children} = this.props;

    return React.cloneElement(children, {
      onClick: this.goEntry
    });
  }
}

EntryLink.defaultProps = {};

EntryLink.propTypes = {
  children: PropTypes.element.isRequired,
  history: PropTypes.instanceOf(Object).isRequired,
  entry: PropTypes.shape({
    category: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    permlink: PropTypes.string.isRequired
  }).isRequired,
  actions: PropTypes.shape({
    setVisitingEntry: PropTypes.func.isRequired
  }).isRequired
};

export default EntryLink;
