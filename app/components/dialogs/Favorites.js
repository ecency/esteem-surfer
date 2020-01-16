/*
eslint-disable react/no-multi-comp, no-underscore-dangle
*/

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { message, Modal, Input } from 'antd';
import { FormattedMessage } from 'react-intl';

import LinearProgress from '../common/LinearProgress';
import UserAvatar from '../elements/UserAvatar';

import { getFavorites } from '../../backend/esteem-client';

class Favorites extends Component {
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

    return getFavorites(activeAccount.username)
      .then(data => {
        this.setState({ data, realData: data });
        return data;
      })
      .catch(() => {
        message.error(intl.formatMessage({ id: 'favorites.load-error' }));
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

    const data = realData.filter(x => x.account.includes(val));

    this.setState({ data });
  };

  accountClicked = item => {
    const { history } = this.props;

    history.push(`/@${item.account}`);
  };

  render() {
    const { intl } = this.props;
    const { data, loading, realData } = this.state;

    return (
      <div className="favorites-dialog-content">
        {loading && <LinearProgress />}
        {realData.length > 0 && (
          <div className="favorites-filter">
            <Input
              placeholder={intl.formatMessage({ id: 'favorites.search' })}
              onChange={this.onSearchChange}
            />
          </div>
        )}
        {data.length > 0 && (
          <div className="favorites-list">
            <div className="favorites-list-body">
              {data.map(item => (
                <div
                  className="favorites-list-item"
                  role="none"
                  key={item._id}
                  onClick={() => {
                    this.accountClicked(item);
                  }}
                >
                  <UserAvatar
                    {...this.props}
                    user={item.account}
                    size="medium"
                  />
                  <span className="account">{item.account}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {!loading && data.length < 1 && (
          <div className="favorites-list">
            <FormattedMessage id="favorites.empty-list" />
          </div>
        )}
      </div>
    );
  }
}

Favorites.propTypes = {
  activeAccount: PropTypes.instanceOf(Object).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired,
  history: PropTypes.instanceOf(Object).isRequired
};

class FavoritesModal extends Component {
  render() {
    const { visible, onCancel, intl } = this.props;

    return (
      <Modal
        visible={visible}
        footer={false}
        width="450px"
        onCancel={onCancel}
        destroyOnClose
        centered
        title={intl.formatMessage({ id: 'favorites.title' })}
      >
        <Favorites {...this.props} />
      </Modal>
    );
  }
}

FavoritesModal.defaultProps = {};

FavoritesModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default FavoritesModal;
