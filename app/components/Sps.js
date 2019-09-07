/*
eslint-disable react/no-multi-comp
*/

import React, { Fragment, PureComponent } from 'react';

import PropTypes from 'prop-types';

import { injectIntl, FormattedMessage, FormattedNumber } from 'react-intl';

import { Table } from 'antd';

import NavBar from './layout/NavBar';
import AppFooter from './layout/AppFooter';
import DeepLinkHandler from './helpers/DeepLinkHandler';

import LinearProgress from './common/LinearProgress';

import QuickProfile from './helpers/QuickProfile';
import EntryLink from './helpers/EntryLink';
import UserAvatar from './elements/UserAvatar';

import { getProposals } from '../backend/steem-client';

const duration = (date1, date2) => {
  const dt2 = new Date(date2);
  const dt1 = new Date(date1);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.round(
    (Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) -
      Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) /
      oneDay
  );
};

class Sps extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      proposals: []
    };
  }

  componentDidMount() {
    this.load();

    window.addEventListener('user-login', this.accountAction);
    window.addEventListener('user-logout', this.accountAction);
    window.addEventListener('account-deleted', this.accountAction);
  }

  componentWillUnmount() {
    window.removeEventListener('user-login', this.accountAction);
    window.removeEventListener('user-logout', this.accountAction);
    window.removeEventListener('account-deleted', this.accountAction);
  }

  accountAction = () => {
    setTimeout(this.refresh, 500);
  };

  refresh = () => {
    this.load();
  };

  load = () => {
    this.fetchProposals();
  };

  fetchProposals = () => {
    this.setState({ loading: true });

    return getProposals()
      .then(resp => {
        const proposals = resp.map((x, i) =>
          Object.assign({}, x, { key: i + 1 })
        );

        this.setState({ proposals });

        return proposals;
      })
      .catch(() => {})
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  render() {
    const { proposals, loading } = this.state;
    const { dynamicProps, intl } = this.props;
    const { steemPerMVests } = dynamicProps;

    const columns = [
      {
        title: '',
        width: 50,
        dataIndex: 'key',

        render: text => <span className="index-num">{text}</span>
      },

      /*
      {
        title: (
          <span className="sps-column-title">
            <FormattedMessage id="sps.creator"/>
          </span>
        ),
        width: 240,
        dataIndex: 'creator',
        render: text => (
          <QuickProfile {...this.props} username={text} reputation={0}>
            <div className="account-card">
              <UserAvatar user={text} size="large"/>
              <span className="username">{text}</span>
            </div>
          </QuickProfile>
        )
      },
      */

      {
        title: '',

        dataIndex: 'receiver',
        render: (text, record) => (
          <div className="description">
            <div className="receiver">
              <QuickProfile {...this.props} username={text} reputation={0}>
                <div className="account-card">
                  <UserAvatar user={text} size="large" />
                  <span className="username">{text}</span>
                </div>
              </QuickProfile>
            </div>
            <div className="post">
              <EntryLink
                {...this.props}
                author={record.creator}
                permlink={record.permlink}
              >
                <div className="post-title">{record.subject}</div>
              </EntryLink>
              {record.creator === record.receiver && (
                <div className="users">
                  by{' '}
                  <QuickProfile
                    {...this.props}
                    username={record.creator}
                    reputation={0}
                  >
                    <span className="user">@{record.creator}</span>
                  </QuickProfile>
                </div>
              )}
              {record.creator !== record.receiver && (
                <div className="users">
                  by{' '}
                  <QuickProfile
                    {...this.props}
                    username={record.creator}
                    reputation={0}
                  >
                    <span className="user">@{record.creator}</span>
                  </QuickProfile>{' '}
                  to{' '}
                  <QuickProfile
                    {...this.props}
                    username={record.receiver}
                    reputation={0}
                  >
                    <span className="user">@{record.receiver}</span>
                  </QuickProfile>
                </div>
              )}
            </div>
          </div>
        )
      },
      {
        title: 'Status',

        dataIndex: 'status',
        render: text => <span>{text}</span>
      },
      {
        title: 'Duration',
        width: 180,
        dataIndex: 'start_date',
        render: (text, record) => {
          const date1 = new Date(record.start_date);
          const date2 = new Date(record.end_date);
          const title = `${intl.formatDate(date1, {
            year: 'numeric',
            month: 'long',
            day: '2-digit'
          })} - ${intl.formatDate(date2, {
            year: 'numeric',
            month: 'long',
            day: '2-digit'
          })}`;
          return (
            <div className="duration">
              <div className="days" title={title}>
                {duration(date1, date2)} days
              </div>
            </div>
          );
        }
      },
      {
        title: 'Total Votes',

        dataIndex: 'total_votes',
        render: text => (
          <Fragment>
            <FormattedNumber
              value={(Number(text) / 1e9) * steemPerMVests}
              minimumFractionDigits={0}
              maximumFractionDigits={0}
            />{' '}
            {'SP'}
          </Fragment>
        )
      }
    ];

    return (
      <div className="wrapper">
        <NavBar
          postBtnActive
          {...Object.assign({}, this.props, {
            reloadFn: () => {
              this.refresh();
            },
            reloading: loading
          })}
        />
        <div className="app-content sps-page">
          <div className={`page-header ${loading ? 'loading' : ''}`}>
            <div className="main-title">
              <FormattedMessage id="sps.page-title" />
            </div>
          </div>
          {loading && <LinearProgress />}

          {!loading && (
            <Fragment>
              <div className="sps-table">
                <Table columns={columns} dataSource={proposals} />
              </div>
            </Fragment>
          )}
        </div>
        <AppFooter {...this.props} />
        <DeepLinkHandler {...this.props} />
      </div>
    );
  }
}

Sps.defaultProps = {
  activeAccount: null
};

Sps.propTypes = {
  activeAccount: PropTypes.instanceOf(Object),
  global: PropTypes.shape({
    pin: PropTypes.string.isRequired
  }).isRequired,
  dynamicProps: PropTypes.shape({
    steemPerMVests: PropTypes.number.isRequired
  }).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default injectIntl(Sps);
