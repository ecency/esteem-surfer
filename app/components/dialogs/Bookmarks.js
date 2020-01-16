/*
eslint-disable react/no-multi-comp, no-underscore-dangle
*/

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { message, Modal, Input } from 'antd';
import { FormattedMessage } from 'react-intl';

import LinearProgress from '../common/LinearProgress';
import UserAvatar from '../elements/UserAvatar';

import { getBookmarks } from '../../backend/esteem-client';
import EntryLink from '../helpers/EntryLink';

class Bookmarks extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      loading: true,
      realData: []
    };
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    this.setState({ data: [], loading: true });

    const { activeAccount, intl } = this.props;

    return getBookmarks(activeAccount.username)
      .then(resp => {
        const data = resp.map(x =>
          Object.assign({}, x, { searchText: `${x.author}/${x.permlink}` })
        );

        this.setState({ data, realData: data });
        return resp;
      })
      .catch(() => {
        message.error(intl.formatMessage({ id: 'bookmarks.load-error' }));
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  onSearchChange = event => {
    const { realData } = this.state;

    const val = event.target.value.trim();

    if (!val) {
      this.setState({ data: realData });
      return;
    }

    const data = realData.filter(x => x.searchText.includes(val));

    this.setState({ data });
  };

  render() {
    const { intl } = this.props;
    const { data, loading, realData } = this.state;

    return (
      <div className="bookmarks-dialog-content">
        {loading && <LinearProgress />}
        {realData.length > 0 && (
          <div className="bookmark-filter">
            <Input
              placeholder={intl.formatMessage({ id: 'bookmarks.search' })}
              onChange={this.onSearchChange}
            />
          </div>
        )}
        {data.length > 0 && (
          <div className="bookmarks-list">
            <div className="bookmarks-list-body">
              {data.map(item => (
                <EntryLink
                  {...this.props}
                  author={item.author}
                  permlink={item.permlink}
                  key={item._id}
                >
                  <div className="bookmarks-list-item" role="none">
                    <UserAvatar
                      {...this.props}
                      user={item.author}
                      size="medium"
                    />
                    <div className="entry-link">
                      <span className="author">{item.author}</span>
                      <span className="permlink">{item.permlink}</span>
                    </div>
                  </div>
                </EntryLink>
              ))}
            </div>
          </div>
        )}
        {!loading && data.length < 1 && (
          <div className="bookmarks-list">
            <FormattedMessage id="bookmarks.empty-list" />
          </div>
        )}
      </div>
    );
  }
}

Bookmarks.propTypes = {
  activeAccount: PropTypes.instanceOf(Object).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired,
  history: PropTypes.instanceOf(Object).isRequired
};

class BookmarksModal extends Component {
  render() {
    const { visible, onCancel, intl } = this.props;

    return (
      <Modal
        visible={visible}
        footer={false}
        width="600px"
        onCancel={onCancel}
        destroyOnClose
        centered
        title={intl.formatMessage({ id: 'bookmarks.title' })}
      >
        <Bookmarks {...this.props} />
      </Modal>
    );
  }
}

BookmarksModal.defaultProps = {};

BookmarksModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default BookmarksModal;
