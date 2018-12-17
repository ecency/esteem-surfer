/*
eslint-disable react/no-multi-comp
*/

import React, { Fragment, PureComponent } from 'react';

import PropTypes from 'prop-types';

import { injectIntl, FormattedMessage, FormattedHTMLMessage } from 'react-intl';

import { Table, Input, Button, message } from 'antd';

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
    const { witness, voted, activeAccount, global, onClick, onSuccess, onError } = this.props;
    const { voting } = this.state;

    if (voting) {
      return false;
    }

    if (onClick) {
      onClick();
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
      if (onError) {
        onError(e);
      }
    }).finally(() => {
      this.setState({ voting: false });
    });
  };

  render() {
    const { voting } = this.state;
    const { voted, witness } = this.props;

    const btnCls = `btn-witness-vote ${voting ? 'in-progress' : ''} ${
      voted ? 'voted' : ''
      } ${witness === '' ? 'disabled' : ''}`;

    return <a className={btnCls} role="none" onClick={this.clicked}>
      {chevronUp}
    </a>;
  }
}

BtnWitnessVote.defaultProps = {
  activeAccount: null,
  onError: null,
  onClick: null
};

BtnWitnessVote.propTypes = {
  global: PropTypes.shape({
    pin: PropTypes.string.isRequired
  }).isRequired,
  voted: PropTypes.bool.isRequired,
  witness: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func,
  onClick: PropTypes.func,
  activeAccount: PropTypes.instanceOf(Object)
};

class ExtraWitnesses extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      inProgress: false
    };
  }

  usernameChanged = (e) => {
    this.setState({ username: e.target.value.trim() });
  };

  onClick = () => {
    this.setState({ inProgress: true });
  };

  onError = () => {
    this.setState({ inProgress: false });
  };

  onSuccess = () => {
    const { onChange } = this.props;
    this.setState({ username: '', inProgress: false });
    onChange();
  };

  render() {
    const { intl, list } = this.props;
    const { username, inProgress } = this.state;

    return (
      <div className="extra-witnesses">
        <div className="explanation">
          <FormattedHTMLMessage id="witnesses.extra-witnesses-exp"/>
        </div>
        <div className="input-form">
          <div className="txt-username">
            <Input type="text" placeholder={intl.formatMessage({ id: 'witnesses.username-placeholder' })}
                   value={username} maxLength={20} onChange={this.usernameChanged} disabled={inProgress}/>
          </div>
          <div className="btn-submit">
            <BtnWitnessVote
              {...this.props}
              witness={username}
              voted={false}
              onClick={this.onClick}
              onError={this.onError}
              onSuccess={this.onSuccess}/>
          </div>
        </div>

        <div className="witnesses-list">
          {list.map(i => (
            <div className="item" key={i}>
              <span className="username">{i}</span>
              <div className="btn-submit">
                <BtnWitnessVote
                  {...this.props}
                  witness={i}
                  voted
                  onSuccess={() => {
                    const { onChange } = this.props;
                    onChange();
                  }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

ExtraWitnesses.propTypes = {
  onChange: PropTypes.func.isRequired,
  list: PropTypes.arrayOf(Object).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

class Proxy extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      username: ''
    };
  }

  render() {

    const { intl } = this.props;
    const { username } = this.state;

    return (
      <div className="proxy">
        <div className="explanation">
          <FormattedHTMLMessage id="witnesses.proxy-exp"/>
        </div>

        <div className="input-form">
          <div className="txt-username">
            <Input type="text" placeholder={intl.formatMessage({ id: 'witnesses.username-placeholder' })}
                   value={username} maxLength={20} onChange={this.usernameChanged}/>
          </div>
          <div className="btn-submit">
            <Button type="primary"><FormattedMessage id="witnesses.set-proxy"/></Button>
          </div>
        </div>
      </div>
    );
  }
}

Proxy.propTypes = {
  intl: PropTypes.instanceOf(Object).isRequired
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

  refresh = () => {
    this.load();
  };

  load = () => {
    this.fetchVotedWitnesses();
    this.fetchWitnesses();
  };

  fetchWitnesses = () => {
    this.setState({ loading: true });

    return getWitnessesByVote(undefined, 50).then(resp => {
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

  render() {
    const { intl, activeAccount } = this.props;
    const { loading, witnesses, witnessVotes } = this.state;
    const extraWitnesses = witnessVotes.filter(w => !witnesses.find(y => y.name === w));

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
          const { name: theWitness } = record;

          const voted = witnessVotes.includes(theWitness);

          return <BtnWitnessVote
            {...this.props}
            witness={theWitness}
            voted={voted}
            onSuccess={(approve) => {

              let newVotes;

              if (approve) {
                newVotes = [...witnessVotes, theWitness];
              } else {
                newVotes = witnessVotes.filter(x => x !== theWitness);
              }

              this.setState({ witnessVotes: newVotes });
              this.fetchVotedWitnesses();
            }}
          />;
        }
      },
      {
        title: <span className="witness-column-title"><FormattedMessage id="witnesses.witness"/></span>,
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
        title: <FormattedMessage id="witnesses.miss"/>,
        dataIndex: 'miss',
        render: (text) => (
          intl.formatNumber(text)
        )
      },
      {
        title: <FormattedMessage id="witnesses.url"/>,
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
        title: <FormattedMessage id="witnesses.fee"/>,
        dataIndex: 'fee'
      },
      {
        title: <FormattedMessage id="witnesses.feed"/>,
        dataIndex: 'feed',
        render: (text) => <span className="feed-price">${text}</span>
      },
      {
        title: <FormattedMessage id="witnesses.block-size"/>,
        dataIndex: 'blockSize',
        render: (text) => (
          intl.formatNumber(text)
        )
      },
      {
        title: <FormattedMessage id="witnesses.ac-avail"/>,
        dataIndex: 'acAvail'
      },
      {
        title: <FormattedMessage id="witnesses.ac-budget"/>,
        dataIndex: 'acBudget'
      },
      {
        title: <FormattedMessage id="witnesses.version"/>,
        dataIndex: 'version',
        fixed: 'right',
        width: 140,
        render: (text) => <span className="version-num">${text}</span>
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
            <div className="main-title"><FormattedMessage id="witnesses.page-title"/></div>
            {(!loading && activeAccount) &&
            <div className="remaining">
              <FormattedHTMLMessage
                id="witnesses.remaining"
                values={{ n: 30 - witnessVotes.length, max: 30 }}
              />
            </div>
            }
          </div>
          {loading &&
          <LinearProgress/>
          }
          {!loading &&
          <Fragment>
            <div className="witnesses-table">
              <Table columns={columns} dataSource={witnesses} scroll={{ x: 1300 }}/>
            </div>
            <div className="extra-funcs">
              <ExtraWitnesses {...this.props} list={extraWitnesses} onChange={this.fetchVotedWitnesses}/>
              <Proxy {...this.props} />
            </div>
          </Fragment>
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