/*
eslint-disable react/no-multi-comp
*/

import React, { Fragment, PureComponent } from 'react';

import PropTypes from 'prop-types';

import { FormattedMessage, FormattedNumber } from 'react-intl';

import { message, Modal, Table } from 'antd';

import {
  delegateVestingShares,
  getVestingDelegations
} from '../../backend/steem-client';

import formatChainError from '../../utils/format-chain-error';

import PinRequired from '../helpers/PinRequired';

import LinearProgress from '../common/LinearProgress';

import AccountLink from '../helpers/AccountLink';

import { vestsToSp } from '../../utils/conversions';

import parseToken from '../../utils/parse-token';

class DelegationList extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      list: []
    };
  }

  componentDidMount() {
    this.load();
  }

  load = () => {
    const { username } = this.props;

    return getVestingDelegations(username)
      .then(resp => {
        this.setState({ list: resp });
        return resp;
      })
      .catch(e => {
        message.error(formatChainError(e));
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  undelegate = (pin, delegatee) => {
    const { activeAccount } = this.props;
    if (activeAccount.type === 's' && !activeAccount.keys.active) {
      message.error('Active key required!');
      return;
    }

    return delegateVestingShares(
      activeAccount,
      pin,
      delegatee,
      '0.000000 VESTS'
    )
      .then(resp => {
        this.load();
        return resp;
      })
      .catch(e => {
        message.error(formatChainError(e));
      });
  };

  render() {
    const { list, loading } = this.state;

    const { dynamicProps, activeAccount, username } = this.props;
    const { steemPerMVests } = dynamicProps;

    if (loading) {
      return (
        <div className="delegate-modal-table">
          <LinearProgress />
        </div>
      );
    }

    const dataSource = list.map((i, k) => ({
      key: k,
      delegatee: i.delegatee,
      vesting_shares: i.vesting_shares
    }));

    const columns = [
      {
        title: null,
        dataIndex: 'delegatee',
        key: 'delegatee',
        render: value => (
          <AccountLink {...this.props} username={value}>
            <a>{value}</a>
          </AccountLink>
        )
      },
      {
        title: null,
        dataIndex: 'vesting_shares',
        key: 'vesting_shares',
        render: value => (
          <Fragment>
            <FormattedNumber
              value={vestsToSp(parseToken(value), steemPerMVests)}
              minimumFractionDigits={3}
            />{' '}
            {'SP'} <br />
            <small>{value}</small>
          </Fragment>
        )
      },
      {
        title: null,
        dataIndex: 'undelegate',
        key: 'undelegate',
        render: (value, record) => {
          if (activeAccount && activeAccount.username === username) {
            return (
              <PinRequired
                {...this.props}
                onSuccess={pin => {
                  this.undelegate(pin, record.delegatee);
                }}
              >
                <span className="btn-delete">
                  <i className="mi">delete_forever</i>
                </span>
              </PinRequired>
            );
          }

          return '';
        }
      }
    ];

    return (
      <div className="delegate-modal-table">
        {dataSource.length === 0 && (
          <div className="empty-list">
            <FormattedMessage id="delegation-list.empty-list" />
          </div>
        )}
        {dataSource.length > 0 && (
          <Table
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            showHeader={false}
          />
        )}
      </div>
    );
  }
}

DelegationList.defaultProps = {
  activeAccount: null
};

DelegationList.propTypes = {
  username: PropTypes.string.isRequired,
  dynamicProps: PropTypes.shape({
    steemPerMVests: PropTypes.number.isRequired
  }).isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  intl: PropTypes.instanceOf(Object).isRequired
};

export default class DelegationListModal extends PureComponent {
  render() {
    const { intl, username, visible, onCancel } = this.props;

    return (
      <Modal
        visible={visible}
        footer={false}
        width="550px"
        onCancel={onCancel}
        destroyOnClose
        centered
        title={intl.formatMessage(
          { id: 'delegated-list.title' },
          { n: username }
        )}
      >
        <DelegationList {...this.props} />
      </Modal>
    );
  }
}

DelegationListModal.defaultProps = {
  onCancel: () => {}
};

DelegationListModal.propTypes = {
  intl: PropTypes.instanceOf(Object).isRequired,
  username: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func
};
