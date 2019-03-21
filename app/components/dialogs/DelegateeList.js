/*
eslint-disable react/no-multi-comp
*/

import React, { Fragment, PureComponent } from 'react';

import PropTypes from 'prop-types';

import { FormattedNumber } from 'react-intl';

import { message, Modal, Table } from 'antd';

import { getDelgateeVestingShares } from '../../backend/esteem-client';

import formatChainError from '../../utils/format-chain-error';

import LinearProgress from '../common/LinearProgress';

import AccountLink from '../helpers/AccountLink';

import { vestsToSp } from '../../utils/conversions';

import parseToken from '../../utils/parse-token';

class DelegateeList extends PureComponent {
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

    return getDelgateeVestingShares(username)
      .then(resp => {
        this.setState({ list: resp.list });
        return resp;
      })
      .catch(e => {
        message.error(formatChainError(e));
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  render() {
    const { list, loading } = this.state;

    const { dynamicProps } = this.props;
    const { steemPerMVests } = dynamicProps;

    if (loading) {
      return (
        <div className="delegatee-modal-table">
          <LinearProgress />
        </div>
      );
    }

    const dataSource = list.map((i, k) => ({
      key: k,
      delegator: i.delegator,
      vesting_shares: i.vesting_shares
    }));

    const columns = [
      {
        title: null,
        dataIndex: 'delegator',
        key: 'delegator',
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
      }
    ];

    return (
      <div className="delegatee-modal-table">
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

DelegateeList.defaultProps = {
  activeAccount: null
};

DelegateeList.propTypes = {
  username: PropTypes.string.isRequired,
  dynamicProps: PropTypes.shape({
    steemPerMVests: PropTypes.number.isRequired
  }).isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  intl: PropTypes.instanceOf(Object).isRequired
};

export default class DelegateeListModal extends PureComponent {
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
          { id: 'delegatee-list.title' },
          { n: username }
        )}
      >
        <DelegateeList {...this.props} />
      </Modal>
    );
  }
}

DelegateeListModal.defaultProps = {
  onCancel: () => {}
};

DelegateeListModal.propTypes = {
  intl: PropTypes.instanceOf(Object).isRequired,
  username: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func
};
