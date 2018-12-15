/*
eslint-disable react/no-multi-comp
*/

import React, { PureComponent } from 'react';

import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';

import { Table, message } from 'antd';

import NavBar from './layout/NavBar';
import AppFooter from './layout/AppFooter';
import DeepLinkHandler from './helpers/DeepLinkHandler';
import EntryLink from './helpers/EntryLink';
import QuickProfile from './helpers/QuickProfile';
import LinearProgress from './common/LinearProgress';

import UserAvatar from './elements/UserAvatar';

import { getWitnessesByVote, getAccount, witnessVote } from '../backend/steem-client';

import parseToken from '../utils/parse-token';
import postUrlParser from '../utils/post-url-parser';
import formatChainError from '../utils/format-chain-error';
import { chevronUp } from '../svg';


class BtnWitnessVote extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      voting: false
    };
  }

  clicked = () => {
    const { witness, voted, activeAccount, global, onSuccess } = this.props;
    const { voting } = this.state;

    if (voting) {
      return false;
    }

    this.setState({ voting: true });

    const approve = !voted;

    return witnessVote(activeAccount, global.pin, witness, approve).then(resp => {
      if (onSuccess) {
        onSuccess(approve);
      }
      return resp;
    }).catch(e => {
      message.error(formatChainError(e));
    }).finally(() => {
      this.setState({ voting: false });
    });
  };

  render() {
    const { voting } = this.state;
    const { voted } = this.props;

    const btnCls = `btn-witness-vote ${voting ? 'in-progress' : ''} ${
      voted ? 'voted' : ''
      }`;

    return <a className={btnCls} role="none" onClick={this.clicked}>
      {chevronUp}
    </a>;
  }
}

BtnWitnessVote.defaultProps = {
  activeAccount: null
};

BtnWitnessVote.propTypes = {
  global: PropTypes.shape({
    pin: PropTypes.string.isRequired
  }).isRequired,
  voted: PropTypes.bool.isRequired,
  witness: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
  activeAccount: PropTypes.instanceOf(Object)
};


class Witnesses extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      witnesses: [],
      witnessVotes: []
    };
  }

  componentDidMount() {
    this.load();
  }

  load = () => {
    this.fetchVotedWitnesses();
    this.fetchWitnesses();
  };

  fetchWitnesses = () => {
    this.setState({ loading: true });

    return getWitnessesByVote(undefined, 100).then(resp => {
      const witnesses = resp.map((x, i) => {

        const key = i + 1;

        const { props } = x;

        const { total_missed: miss, url } = x;
        const fee = parseToken(props.account_creation_fee);
        const feed = parseToken(x.sbd_exchange_rate.base);
        const { maximum_block_size: blockSize } = props;
        const { available_witness_account_subsidies: acAvail } = x;
        const { account_subsidy_budget: acBudget } = props;
        const { running_version: version } = x;

        return {
          key,
          name: x.owner,
          miss,
          fee,
          feed,
          blockSize,
          acAvail: Math.round(acAvail / 10000),
          acBudget,
          version,
          url,
          parsedUrl: postUrlParser(url)
        };
      });
      this.setState({ witnesses });
      return resp;
    }).catch(() => {

    }).finally(() => {
      this.setState({ loading: false });
    });
  };

  fetchVotedWitnesses = () => {
    const { activeAccount } = this.props;
    if (activeAccount) {
      return getAccount(activeAccount.username).then(resp => {
        const { witness_votes: witnessVotes } = resp;
        this.setState({ witnessVotes });
        return resp;
      });
    }
  };

  refresh = () => {
    this.fetchWitnesses();
  };

  render() {
    const { intl } = this.props;
    const { loading, witnesses } = this.state;

    const columns = [
      {
        title: '',
        width: 68,
        dataIndex: 'key',
        fixed: 'left',
        render: (text) => (
          <span className="index-num">{text}</span>
        )
      },
      {
        title: '',
        fixed: 'left',
        render: (text, record) => {
          let { witnessVotes } = this.state;
          const { name: theWitness } = record;

          const voted = witnessVotes.includes(theWitness);

          return <BtnWitnessVote
            {...this.props}
            witness={theWitness}
            voted={voted}
            onSuccess={(approve) => {

              if (approve) {
                witnessVotes.push(theWitness);
              } else {
                witnessVotes = witnessVotes.filter(x => x !== theWitness);
              }

              this.setState({ witnessVotes });
              this.fetchVotedWitnesses();

            }}
          />;
        }
      },
      {
        title: <span className="witness-column-title">Witness</span>,
        width: 260,
        dataIndex: 'name',
        fixed: 'left',
        render: (text) => (
          <QuickProfile {...this.props} username={text}>
            <div className="witness-card">
              <UserAvatar user={text} size="large"/>
              <span className="username">{text}</span>
            </div>
          </QuickProfile>
        )
      },
      {
        title: 'Miss',
        dataIndex: 'miss',
        render: (text) => (
          intl.formatNumber(text)
        )
      },
      {
        title: 'URL',
        render: (text, record) => {
          const { parsedUrl } = record;

          if (parsedUrl) {
            return <EntryLink {...this.props} author={parsedUrl.author} permlink={parsedUrl.permlink}>
              <a target="_external" href={parsedUrl.url} className="witness-link"><i className="mi">link</i></a>
            </EntryLink>;
          }

          return <a target="_external" href={record.url} className="witness-link"><i className="mi">link</i></a>;
        }
      },
      {
        title: 'Fee',
        dataIndex: 'fee'
      },
      {
        title: 'Feed',
        dataIndex: 'feed'
      },
      {
        title: 'Block size',
        dataIndex: 'blockSize',
        render: (text) => (
          intl.formatNumber(text)
        )
      },
      {
        title: 'AC avail',
        dataIndex: 'acAvail'
      },
      {
        title: 'AC budget',
        dataIndex: 'acBudget'
      },
      {
        title: 'Version',
        dataIndex: 'version',
        fixed: 'right',
        width: 140
      }
    ];

    return (
      <div className="wrapper">
        <NavBar
          {...Object.assign({}, this.props, {
            reloadFn: () => {
              this.refresh();
            },
            reloading: loading
          })}
        />
        <div className="app-content witnesses-page">
          <div className={`page-header ${loading ? 'loading' : ''}`}>
            <div className="main-title">Witness Voting</div>
          </div>
          {loading &&
          <LinearProgress/>
          }
          {!loading &&
          <Table columns={columns} dataSource={witnesses} scroll={{ x: 1300 }} pagination={false}/>
          }
        </div>
        <AppFooter {...this.props} />
        <DeepLinkHandler {...this.props} />
      </div>
    );
  }
}

Witnesses.defaultProps = {
  activeAccount: null
};

Witnesses.propTypes = {
  activeAccount: PropTypes.instanceOf(Object),
  global: PropTypes.shape({
    pin: PropTypes.string.isRequired
  }).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default injectIntl(Witnesses);