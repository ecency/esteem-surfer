/*
eslint-disable react/no-multi-comp, jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
*/

import React, { Fragment, PureComponent } from 'react';

import PropTypes from 'prop-types';

import moment from 'moment';

import { injectIntl, FormattedMessage, FormattedNumber } from 'react-intl';

import { Modal, Table, Row, Col, Badge } from 'antd';

import NavBar from './layout/NavBar';
import AppFooter from './layout/AppFooter';

import LinearProgress from './common/LinearProgress';

import QuickProfile from './helpers/QuickProfile';
import EntryLink from './helpers/EntryLink';
import UserAvatar from './elements/UserAvatar';

import { getProposals, getProposalVoters, getAccounts } from '../backend/steem-client';
import LoginRequired from './helpers/LoginRequired';
import { chevronUp } from '../svg';

import parseToken from '../utils/parse-token';
import AccountLink from './helpers/AccountLink';
import authorReputation from '../utils/author-reputation';

const duration = (date1, date2) => {
  const a = moment(date1);
  const b = moment(date2);
  return b.diff(a, 'days');
};


class SpsVotersModal extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      accounts: [],
      loading: false
    };
  }

  componentDidMount() {
    this.fetchProposals();
  }

  fetchProposals = () => {
    const { voters, dynamicProps } = this.props;
    const { steemPerMVests } = dynamicProps;

    this.setState({ loading: true });
    getAccounts(voters).then(resp => {
      const accounts = resp.map(account => {
        const sp = parseToken(account.vesting_shares) * steemPerMVests / 1e3;
        const proxySP = parseToken(account.proxied_vsf_votes[0]) * steemPerMVests / 1e9;
        const totalSP = sp + proxySP;
        return { name: account.name, reputation: account.reputation, sp, proxySP, totalSP };
      }).sort((a, b) => (b.totalSP > a.totalSP) ? 1 : -1);

      this.setState({ accounts, loading: false });
      return accounts;
    }).catch(() => {
      this.setState({ loading: false });
    });
  };

  render() {
    const { loading, accounts } = this.state;
    const { intl, onCancel } = this.props;


    const columns = [
      {
        title: 'Voter',
        dataIndex: 'name',
        width: 210,
        render: (text, record) => <span>
            <AccountLink {...this.props} username={text}>
              <span style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                {text}
              </span>
            </AccountLink>{' '}
          <Badge
            count={authorReputation(record.reputation)}
            style={{
              backgroundColor: '#fff',
              color: '#999',
              boxShadow: '0 0 0 1px #d9d9d9 inset'
            }}
          />
          </span>
      },
      {
        title: 'SP',
        dataIndex: 'sp',
        width: 200,
        render: text => <FormattedNumber
          value={text}
          minimumFractionDigits={0}
          maximumFractionDigits={0}
        />
      },
      {
        title: 'Proxy SP',
        dataIndex: 'proxySP',
        width: 200,
        render: text => text > 0 ? <FormattedNumber
          value={text}
          minimumFractionDigits={0}
          maximumFractionDigits={0}
        /> : ''
      },
      {
        title: 'Total SP',
        dataIndex: 'totalSP',
        width: 200,
        render: text => text > 0 ? <FormattedNumber
          value={text}
          minimumFractionDigits={0}
          maximumFractionDigits={0}
        /> : ''
      }
    ];

    return <Modal
      visible
      footer={false}
      width="750px"
      destroyOnClose
      onCancel={onCancel}
      centered
      title={intl.formatMessage({ id: 'sps.voters' })}
    >
      <div className="sps-voters-dialog-content">
        <Table loading={loading} columns={columns} dataSource={accounts} scroll={{ y: 310 }}/>
      </div>
    </Modal>;
  }
}

SpsVotersModal.defaultProps = {
  onCancel: () => {
  }
};

SpsVotersModal.propTypes = {
  intl: PropTypes.instanceOf(Object).isRequired,
  voters: PropTypes.arrayOf(PropTypes.string).isRequired,
  dynamicProps: PropTypes.shape({
    steemPerMVests: PropTypes.number.isRequired
  }).isRequired,
  onCancel: PropTypes.func
};


class BtnVote extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      voting: false,
      voted: false
    };
  }

  render() {
    const { voting, voted, loading } = this.state;
    const { activeAccount, voters } = this.props;


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
  proposal: PropTypes.instanceOf(Object),
  voters: PropTypes.arrayOf(PropTypes.string),
  activeAccount: PropTypes.instanceOf(Object),
  intl: PropTypes.instanceOf(Object).isRequired
};


class SpsListItem extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      voters: [],
      loading: false,
      modal: false
    };
  }

  componentDidMount() {
    this.fetchProposals();
  }

  fetchProposals = () => {
    const { proposal } = this.props;

    this.setState({ loading: true });

    getProposalVoters(proposal.proposal_id).then(voters => {
      this.setState({ voters, loading: false });
      return voters;
    }).catch(() => {
      this.setState({ loading: false });
    });
  };

  toggleModal = () => {
    const { modal } = this.state;
    this.setState({ modal: !modal });
  };

  render() {
    const { voters, loading, modal } = this.state;

    const { proposal, intl, dynamicProps } = this.props;
    const { steemPerMVests } = dynamicProps;

    const startDate = new Date(proposal.start_date);
    const endDate = new Date(proposal.end_date);

    const durationDays = `${intl.formatDate(startDate, {
      year: 'numeric',
      month: 'long',
      day: '2-digit'
    })} - ${intl.formatDate(endDate, {
      year: 'numeric',
      month: 'long',
      day: '2-digit'
    })}`;

    const dailyRequested = proposal.daily_pay.amount / 1000;
    const allRequested = dailyRequested * duration(startDate, endDate);

    return (
      <Fragment>
        <Row className="sps-list-item">
          <Col span={1}>
            <BtnVote {...this.props} proposal={proposal} voters={voters}/>
          </Col>
          <Col span={13}>
            <div className="description">
              <div className="post-title">
                <EntryLink
                  {...this.props}
                  author={proposal.creator}
                  permlink={proposal.permlink}
                >
                  <div className="post-title">{proposal.subject}</div>
                </EntryLink>
              </div>
              <div className="users">
                <QuickProfile
                  {...this.props}
                  username={proposal.creator}
                  reputation={0}
                >
                  <div className="user">
                    <UserAvatar user={proposal.creator} size="large"/>
                    <span className="username">{proposal.creator}</span>
                  </div>
                </QuickProfile>
                {proposal.creator !== proposal.receiver && (
                  <Fragment>
                    <span className="to">{'>'}</span>
                    <QuickProfile
                      {...this.props}
                      username={proposal.receiver}
                      reputation={0}>
                      <div className="user">
                        <UserAvatar user={proposal.receiver} size="large"/>
                        <span className="username">{proposal.receiver}</span>
                      </div>
                    </QuickProfile>
                  </Fragment>
                )}
              </div>
              <span className={`status ${proposal.status}`}><FormattedMessage
                id={`sps.status-${proposal.status}`}/></span>
            </div>

          </Col>
          <Col span={3} className="duration">
            <div className="days" title={durationDays}>
              <FormattedMessage id="sps.duration-days" values={{ n: duration(startDate, endDate) }}/>
            </div>
          </Col>
          <Col span={3}>
            <div className="requested">
              <div className="daily">
                <FormattedNumber
                  value={dailyRequested}
                  minimumFractionDigits={0}
                  maximumFractionDigits={1}
                /> {'SBD'}
              </div>
              <div className="all">
                <FormattedNumber
                  value={allRequested}
                  minimumFractionDigits={0}
                  maximumFractionDigits={1}
                /> {'SBD'}
              </div>
            </div>
          </Col>
          <Col span={4}>
            <a className="total-votes" onClick={this.toggleModal}>
              <FormattedNumber
                value={(Number(proposal.total_votes) / 1e9) * steemPerMVests}
                minimumFractionDigits={0}
                maximumFractionDigits={0}
              />{' '}
              {'SP'}
            </a>
          </Col>
        </Row>
        {modal &&
        <SpsVotersModal {...this.props} proposal={proposal} voters={voters} onCancel={this.toggleModal}/>
        }
      </Fragment>
    );
  }
}

SpsListItem.defaultProps = {
  proposal: null
};

SpsListItem.propTypes = {
  intl: PropTypes.instanceOf(Object).isRequired,
  proposal: PropTypes.instanceOf(Object),
  dynamicProps: PropTypes.shape({
    steemPerMVests: PropTypes.number.isRequired
  }).isRequired
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
              <div className="sps-list">
                <Row className="sps-list-header">
                  <Col span={3} offset={14}>
                    <FormattedMessage id="sps.duration"/>
                  </Col>
                  <Col span={3}>
                    <FormattedMessage id="sps.requested"/>
                  </Col>
                  <Col span={4}>
                    <FormattedMessage id="sps.total-votes"/>
                  </Col>
                </Row>
                {proposals.map(p => (<SpsListItem key={p.proposal_id} {...this.props} proposal={p}/>))}
              </div>
            </Fragment>
          )}
        </div>
        <AppFooter {...this.props} />
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
