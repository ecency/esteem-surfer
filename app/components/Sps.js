/*
eslint-disable react/no-multi-comp
*/

import React, { Fragment, PureComponent } from 'react';

import PropTypes from 'prop-types';

import moment from 'moment';

import { injectIntl, FormattedMessage, FormattedNumber } from 'react-intl';

import { Table } from 'antd';

import NavBar from './layout/NavBar';
import AppFooter from './layout/AppFooter';
import DeepLinkHandler from './helpers/DeepLinkHandler';

import LinearProgress from './common/LinearProgress';

import QuickProfile from './helpers/QuickProfile';
import EntryLink from './helpers/EntryLink';
import UserAvatar from './elements/UserAvatar';

import { getProposals, getProposalVoters } from '../backend/steem-client';
import LoginRequired from './helpers/LoginRequired';
import { chevronUp } from '../svg';

const duration = (date1, date2) => {
  const a = moment(date1);
  const b = moment(date2);
  return b.diff(a, 'days');
};


class BtnVote extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      votes: [],
      voted: false,
      loading: false
    };
  }

  componentDidMount() {

    const { proposalId } = this.props;

    this.setState({ loading: true });

    getProposalVoters(proposalId).then(resp => {
      const votes = resp.map(x => ({ id: x.id, voter: x.voter }));
      this.setState({ votes, loading: false });
      return resp;
    }).catch(() => {
      this.setState({ loading: false });
    });
  }

  render() {
    const { voting, voted, loading } = this.state;
    const { activeAccount } = this.props;

    const btnCls = `btn-witness-vote ${voting ? 'in-progress' : ''} ${
      voted ? 'voted' : ''
    } ${loading ? 'disabled' : ''}`;

    if (voted) {
      return (
        <LoginRequired {...this.props} requiredKeys={['active']}>
          <a className={btnCls} role="none" onClick={this.clicked}>
            {chevronUp}
          </a>
        </LoginRequired>
      );
    }

    return (
      <LoginRequired {...this.props} requiredKeys={['active']}>
        <a className={btnCls} role="none" onClick={this.clicked}>
          {chevronUp}
        </a>
      </LoginRequired>
    );
  }
}


BtnVote.defaultProps = {
  activeAccount: null
};

BtnVote.propTypes = {
  proposalId: PropTypes.number.isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  intl: PropTypes.instanceOf(Object).isRequired
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
      .catch(() => {
      })
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
        dataIndex: 'key',
        render: (text, record) => <BtnVote {...this.props} proposalId={record.proposal_id}/>
      },

      {
        title: '',
        className: 'first-col',
        dataIndex: 'receiver',
        render: (text, record) => (
          <div className="description">
            <div className="post-title">
              <EntryLink
                {...this.props}
                author={record.creator}
                permlink={record.permlink}
              >
                <div className="post-title">{record.subject}</div>
              </EntryLink>
            </div>
            <div className="users">
              <QuickProfile
                {...this.props}
                username={record.creator}
                reputation={0}
              >
                <div className="user">
                  <UserAvatar user={record.creator} size="large"/>
                  <span className="username">{record.creator}</span>
                </div>
              </QuickProfile>
              {record.creator !== record.receiver && (
                <Fragment>
                  <span className="to">{'>'}</span>
                  <QuickProfile
                    {...this.props}
                    username={record.receiver}
                    reputation={0}>
                    <div className="user">
                      <UserAvatar user={record.receiver} size="large"/>
                      <span className="username">{record.receiver}</span>
                    </div>
                  </QuickProfile>
                </Fragment>
              )}
            </div>
            <span className={`status ${record.status}`}><FormattedMessage id={`sps.status-${record.status}`}/></span>
          </div>
        )
      },

      {
        title: <FormattedMessage id="sps.duration"/>,
        width: 130,
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
                <FormattedMessage id="sps.duration-days" values={{ n: duration(date1, date2) }}/>
              </div>
            </div>
          );
        }
      },
      {
        title: <FormattedMessage id="sps.requested"/>,
        width: 130,
        dataIndex: '',
        render: record => {
          const date1 = new Date(record.start_date);
          const date2 = new Date(record.end_date);

          const daily = record.daily_pay.amount / 1000;
          const all = daily * duration(date1, date2);

          return <div className="requested">
            <div className="daily">
              <FormattedNumber
                value={daily}
                minimumFractionDigits={0}
                maximumFractionDigits={1}
              /> {'SBD'}
            </div>
            <div className="all">
              <FormattedNumber
                value={all}
                minimumFractionDigits={0}
                maximumFractionDigits={1}
              /> {'SBD'}
            </div>
          </div>;
        }
      },
      {
        title: <FormattedMessage id="sps.total-votes"/>,
        className: 'last-col',
        width: 220,
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
              <FormattedMessage id="sps.page-title"/>
            </div>
          </div>
          {loading && <LinearProgress/>}

          {!loading && (
            <Fragment>
              <div className="sps-table">
                <Table columns={columns} dataSource={proposals}/>
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
