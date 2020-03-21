/*
eslint-disable react/no-multi-comp, jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
*/

import React, { Fragment, PureComponent } from 'react';

import PropTypes from 'prop-types';

import { injectIntl, FormattedMessage, FormattedNumber } from 'react-intl';

import { Modal, Table, Row, Col, Badge, message } from 'antd';

import moment from 'moment';

import NavBar from './layout/NavBar';
import AppFooter from './layout/AppFooter';
import UserAvatar from './elements/UserAvatar';
import LinearProgress from './common/LinearProgress';
import LoginRequired from './helpers/LoginRequired';
import QuickProfile from './helpers/QuickProfile';
import EntryLink from './helpers/EntryLink';
import AccountLink from './helpers/AccountLink';
import DeepLinkHandler from './helpers/DeepLinkHandler';

import parseToken from '../utils/parse-token';
import authorReputation from '../utils/author-reputation';

import {
  getProposals,
  getProposalVoters,
  getAccounts,
  voteProposal
} from '../backend/steem-client';

import { chevronUp } from '../svg';
import formatChainError from '../utils/format-chain-error';

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
    getAccounts(voters)
      .then(resp => {
        const accounts = resp
          .map(account => {
            const sp =
              (parseToken(account.vesting_shares) * steemPerMVests) / 1e3;
            const proxySP =
              (parseToken(account.proxied_vsf_votes[0]) * steemPerMVests) / 1e9;
            const totalSP = sp + proxySP;
            return {
              name: account.name,
              reputation: account.reputation,
              sp,
              proxySP,
              totalSP
            };
          })
          .sort((a, b) => (b.totalSP > a.totalSP ? 1 : -1));

        this.setState({ accounts, loading: false });
        return accounts;
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };

  render() {
    const { loading, accounts } = this.state;
    const { intl, onCancel } = this.props;

    const columns = [
      {
        title: <FormattedMessage id="sps.voter" />,
        dataIndex: 'name',
        width: 210,
        render: (text, record) => (
          <span>
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
        )
      },
      {
        title: <FormattedMessage id="sps.voter-sp" />,
        dataIndex: 'sp',
        width: 200,
        render: text => (
          <FormattedNumber
            value={text}
            minimumFractionDigits={0}
            maximumFractionDigits={0}
          />
        )
      },
      {
        title: <FormattedMessage id="sps.voter-proxy-sp" />,
        dataIndex: 'proxySP',
        width: 200,
        render: text =>
          text > 0 ? (
            <FormattedNumber
              value={text}
              minimumFractionDigits={0}
              maximumFractionDigits={0}
            />
          ) : (
            ''
          )
      },
      {
        title: <FormattedMessage id="sps.voter-total-sp" />,
        dataIndex: 'totalSP',
        width: 200,
        render: text =>
          text > 0 ? (
            <FormattedNumber
              value={text}
              minimumFractionDigits={0}
              maximumFractionDigits={0}
            />
          ) : (
            ''
          )
      }
    ];

    return (
      <Modal
        visible
        footer={false}
        width="750px"
        destroyOnClose
        onCancel={onCancel}
        centered
        title={intl.formatMessage({ id: 'sps.voters' })}
      >
        <div className="sps-voters-dialog-content">
          <Table
            loading={loading}
            columns={columns}
            dataSource={accounts}
            scroll={{ y: 310 }}
          />
        </div>
      </Modal>
    );
  }
}

SpsVotersModal.defaultProps = {
  onCancel: () => {}
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
      voting: false
    };
  }

  clicked = () => {
    const {
      proposal,
      voters,
      global,
      onSuccess,
      intl,
      activeAccount
    } = this.props;
    const voted = voters.includes(activeAccount.username);
    const { proposal_id: proposalId } = proposal;
    const approve = !voted;

    this.setState({ voting: true });
    return voteProposal(activeAccount, global.pin, proposalId, approve)
      .then(resp => {
        if (onSuccess) {
          onSuccess(approve);
        }
        if (approve) {
          message.success(
            intl.formatMessage({ id: 'sps.voted' }, { n: proposalId })
          );
        } else {
          message.info(
            intl.formatMessage({ id: 'sps.vote-removed' }, { n: proposalId })
          );
        }

        return resp;
      })
      .catch(e => {
        message.error(formatChainError(e));
      })
      .finally(() => {
        this.setState({ voting: false });
      });
  };

  render() {
    const { voting } = this.state;
    const { activeAccount, voters, loading } = this.props;
    const voted =
      activeAccount !== null && voters.includes(activeAccount.username);

    const disabled = loading || voting;

    const btnCls = `btn-witness-vote ${voting ? 'in-progress' : ''} ${
      voted ? 'voted' : ''
    } ${disabled ? 'disabled' : ''}`;

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
  proposal: PropTypes.instanceOf(Object).isRequired,
  voters: PropTypes.arrayOf(PropTypes.string).isRequired,
  loading: PropTypes.bool.isRequired,
  global: PropTypes.shape({
    pin: PropTypes.string.isRequired
  }).isRequired,
  onSuccess: PropTypes.func.isRequired,
  intl: PropTypes.instanceOf(Object).isRequired,
  activeAccount: PropTypes.instanceOf(Object)
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

    getProposalVoters(proposal.proposal_id)
      .then(voters => {
        this.setState({ voters, loading: false });
        return voters;
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };

  onVoteSuccess = approve => {
    const { voters } = this.state;
    const { activeAccount } = this.props;

    if (activeAccount === null) {
      return;
    }

    const newVoters = approve
      ? [...voters, activeAccount.username]
      : voters.filter(x => x !== activeAccount.username);

    this.setState({ voters: newVoters });
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
        <Row className="sps-list-item" id={`pr-${proposal.id}`}>
          <Col span={1}>
            <div className="voting">
              <BtnVote
                {...this.props}
                proposal={proposal}
                voters={voters}
                loading={loading}
                onSuccess={this.onVoteSuccess}
              />
            </div>
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
                    <UserAvatar
                      {...this.props}
                      user={proposal.creator}
                      size="large"
                    />
                    <span className="username">{proposal.creator}</span>
                  </div>
                </QuickProfile>
                {proposal.creator !== proposal.receiver && (
                  <Fragment>
                    <span className="to">{'>'}</span>
                    <QuickProfile
                      {...this.props}
                      username={proposal.receiver}
                      reputation={0}
                    >
                      <div className="user">
                        <UserAvatar
                          {...this.props}
                          user={proposal.receiver}
                          size="large"
                        />
                        <span className="username">{proposal.receiver}</span>
                      </div>
                    </QuickProfile>
                  </Fragment>
                )}
              </div>
              <span className={`status ${proposal.status}`}>
                <FormattedMessage id={`sps.status-${proposal.status}`} />
              </span>
            </div>
          </Col>
          <Col span={3} className="duration">
            <div className="days" title={durationDays}>
              <FormattedMessage
                id="sps.duration-days"
                values={{ n: duration(startDate, endDate) }}
              />
            </div>
          </Col>
          <Col span={3}>
            <div className="requested">
              <div className="daily">
                <FormattedNumber
                  value={dailyRequested}
                  minimumFractionDigits={0}
                  maximumFractionDigits={1}
                />{' '}
                {'HBD'}
              </div>
              <div className="all">
                <FormattedNumber
                  value={allRequested}
                  minimumFractionDigits={0}
                  maximumFractionDigits={1}
                />{' '}
                {'HBD'}
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
        {modal && (
          <SpsVotersModal
            {...this.props}
            proposal={proposal}
            voters={voters}
            onCancel={this.toggleModal}
          />
        )}
      </Fragment>
    );
  }
}

SpsListItem.defaultProps = {
  activeAccount: null
};

SpsListItem.propTypes = {
  intl: PropTypes.instanceOf(Object).isRequired,
  proposal: PropTypes.instanceOf(Object).isRequired,
  dynamicProps: PropTypes.shape({
    steemPerMVests: PropTypes.number.isRequired
  }).isRequired,
  activeAccount: PropTypes.instanceOf(Object)
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
      .then(r => {
        const { temp, actions } = this.props;

        if (temp && temp.type && temp.type === 'sps') {
          const { proposal } = temp;
          setTimeout(() => {
            const e = document.querySelector(`#pr-${proposal}`);
            console.log(e);
            if (e) {
              e.classList.add('highlighted');
              e.scrollIntoView();
            }
          });

          actions.tempReset();
        }
        return r;
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
              <FormattedMessage id="sps.page-title" />
            </div>
          </div>
          {loading && <LinearProgress />}

          {!loading && (
            <Fragment>
              <div className="sps-list">
                <Row className="sps-list-header">
                  <Col span={3} offset={14}>
                    <FormattedMessage id="sps.duration" />
                  </Col>
                  <Col span={3}>
                    <FormattedMessage id="sps.requested" />
                  </Col>
                  <Col span={4}>
                    <FormattedMessage id="sps.total-votes" />
                  </Col>
                </Row>
                {proposals.map(p => (
                  <SpsListItem
                    key={p.proposal_id}
                    {...this.props}
                    proposal={p}
                  />
                ))}
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
  activeAccount: null,
  temp: null
};

Sps.propTypes = {
  dynamicProps: PropTypes.shape({
    steemPerMVests: PropTypes.number.isRequired
  }).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  actions: PropTypes.shape({
    tempReset: PropTypes.func.isRequired
  }).isRequired,
  temp: PropTypes.instanceOf(Object)
};

export default injectIntl(Sps);
