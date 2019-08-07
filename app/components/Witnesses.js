/*
eslint-disable react/no-multi-comp
*/

import React, { Fragment, PureComponent } from 'react';

import PropTypes from 'prop-types';

import { injectIntl, FormattedMessage, FormattedHTMLMessage } from 'react-intl';

import { Table, Input, Button, message, Icon } from 'antd';

import NavBar from './layout/NavBar';
import AppFooter from './layout/AppFooter';
import DeepLinkHandler from './helpers/DeepLinkHandler';
import EntryLink from './helpers/EntryLink';
import QuickProfile from './helpers/QuickProfile';
import LinearProgress from './common/LinearProgress';

import UserAvatar from './elements/UserAvatar';

import {
  getWitnessesByVote,
  getAccount,
  witnessVote,
  witnessProxy
} from '../backend/steem-client';

import parseToken from '../utils/parse-token';
import postUrlParser from '../utils/post-url-parser';
import formatChainError from '../utils/format-chain-error';
import { chevronUp } from '../svg';
import LoginRequired from './helpers/LoginRequired';

class BtnWitnessVote extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      voting: false
    };
  }

  clicked = () => {
    const {
      witness,
      voted,
      activeAccount,
      global,
      onClick,
      onSuccess,
      onError,
      intl
    } = this.props;
    const { voting } = this.state;

    if (voting) {
      return false;
    }

    if (onClick) {
      onClick();
    }

    this.setState({ voting: true });

    const approve = !voted;

    return witnessVote(activeAccount, global.pin, witness, approve)
      .then(resp => {
        if (onSuccess) {
          onSuccess(approve);
        }
        if (approve) {
          message.success(
            intl.formatMessage({ id: 'witnesses.voted' }, { n: witness })
          );
        } else {
          message.info(
            intl.formatMessage({ id: 'witnesses.vote-removed' }, { n: witness })
          );
        }

        return resp;
      })
      .catch(e => {
        message.error(formatChainError(e));
        if (onError) {
          onError(e);
        }
      })
      .finally(() => {
        this.setState({ voting: false });
      });
  };

  render() {
    const { voting } = this.state;
    const { voted, witness } = this.props;

    const btnCls = `btn-witness-vote ${voting ? 'in-progress' : ''} ${
      voted ? 'voted' : ''
    } ${witness === '' ? 'disabled' : ''}`;

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
  activeAccount: PropTypes.instanceOf(Object),
  intl: PropTypes.instanceOf(Object).isRequired
};

class ExtraWitnesses extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      inProgress: false
    };
  }

  usernameChanged = e => {
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
          <FormattedHTMLMessage id="witnesses.extra-witnesses-exp" />
        </div>
        <div className="input-form">
          <div className="txt-username">
            <Input
              type="text"
              placeholder={intl.formatMessage({
                id: 'witnesses.username-placeholder'
              })}
              value={username}
              maxLength={20}
              onChange={this.usernameChanged}
              disabled={inProgress}
            />
          </div>
          <div className="btn-submit">
            <BtnWitnessVote
              {...this.props}
              witness={username}
              voted={false}
              onClick={this.onClick}
              onError={this.onError}
              onSuccess={this.onSuccess}
            />
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
                  }}
                />
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
      username: '',
      inProgress: false
    };
  }

  usernameChanged = e => {
    this.setState({ username: e.target.value.trim() });
  };

  clicked = () => {
    const { activeAccount, global, onChange, intl } = this.props;

    const { username } = this.state;
    this.setState({ inProgress: true });

    return witnessProxy(activeAccount, global.pin, username)
      .then(resp => {
        message.success(
          intl.formatMessage({ id: 'witnesses.proxy-created' }, { n: username })
        );
        this.setState({ username: '', inProgress: false }, () => {
          onChange();
        });
        return resp;
      })
      .catch(e => {
        message.error(formatChainError(e));
        this.setState({ inProgress: false });
      });
  };

  render() {
    const { intl } = this.props;
    const { username, inProgress } = this.state;

    return (
      <div className="proxy">
        <div className="explanation">
          <FormattedHTMLMessage id="witnesses.proxy-exp" />
        </div>
        <div className="input-form">
          <div className="txt-username">
            <Input
              type="text"
              placeholder={intl.formatMessage({
                id: 'witnesses.username-placeholder'
              })}
              value={username}
              maxLength={20}
              onChange={this.usernameChanged}
            />
          </div>
          <div className="btn-submit">
            <LoginRequired {...this.props} requiredKeys={['active']}>
              <Button
                type="primary"
                disabled={username === '' || inProgress}
                onClick={this.clicked}
              >
                {inProgress && (
                  <Icon type="loading" style={{ fontSize: 12 }} spin />
                )}
                <FormattedMessage id="witnesses.set-proxy" />
              </Button>
            </LoginRequired>
          </div>
        </div>
      </div>
    );
  }
}

Proxy.defaultProps = {
  activeAccount: null
};

Proxy.propTypes = {
  onChange: PropTypes.func.isRequired,
  global: PropTypes.shape({
    pin: PropTypes.string.isRequired
  }).isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  intl: PropTypes.instanceOf(Object).isRequired
};

class ProxyActive extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      inProgress: false
    };
  }

  clicked = () => {
    const { activeAccount, global, onChange, intl } = this.props;

    this.setState({ inProgress: true });

    return witnessProxy(activeAccount, global.pin, '')
      .then(resp => {
        message.info(intl.formatMessage({ id: 'witnesses.proxy-removed' }));
        this.setState({ inProgress: false }, () => {
          onChange();
        });
        return resp;
      })
      .catch(e => {
        message.error(formatChainError(e));
        this.setState({ inProgress: false });
      });
  };

  render() {
    const { username } = this.props;
    const { inProgress } = this.state;

    return (
      <div className="proxy-active">
        <div className="proxy-active-exp">
          <FormattedMessage id="witnesses.proxy-active-exp" />
        </div>
        <div className="clear-proxy-form">
          <div className="current-proxy">
            <FormattedHTMLMessage
              id="witnesses.current-proxy"
              values={{ n: username }}
            />
          </div>
          <LoginRequired {...this.props} requiredKeys={['active']}>
            <Button type="primary" size="large" disabled={inProgress}>
              {inProgress && (
                <Icon type="loading" style={{ fontSize: 12 }} spin />
              )}
              <FormattedMessage id="witnesses.remove-proxy" />
            </Button>
          </LoginRequired>
        </div>
      </div>
    );
  }
}

ProxyActive.propTypes = {
  username: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  global: PropTypes.shape({
    pin: PropTypes.string.isRequired
  }).isRequired,
  activeAccount: PropTypes.instanceOf(Object).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

class Witnesses extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      witnesses: [],
      witnessVotes: [],
      proxy: null
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
    this.fetchVotedWitnesses();
    this.fetchWitnesses();
  };

  fetchWitnesses = () => {
    this.setState({ loading: true });

    return getWitnessesByVote(undefined, 50)
      .then(resp => {
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
      })
      .catch(() => {})
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  fetchVotedWitnesses = () => {
    const { activeAccount } = this.props;
    if (activeAccount) {
      return getAccount(activeAccount.username).then(resp => {
        const { witness_votes: witnessVotes, proxy } = resp;
        this.setState({ witnessVotes, proxy });

        return resp;
      });
    }

    this.setState({ witnessVotes: [], proxy: null });
  };

  render() {
    const { intl, activeAccount } = this.props;
    const { loading, witnesses, witnessVotes, proxy } = this.state;
    const extraWitnesses = witnessVotes.filter(
      w => !witnesses.find(y => y.name === w)
    );

    const columns = [
      {
        title: '',
        width: 50,
        dataIndex: 'key',
        render: text => <span className="index-num">{text}</span>
      },
      {
        title: '',
        width: 40,
        render: (text, record) => {
          const { name: theWitness } = record;
          const voted = witnessVotes.includes(theWitness);
          return (
            <BtnWitnessVote
              {...this.props}
              witness={theWitness}
              voted={voted}
              onSuccess={approve => {
                let newVotes;

                if (approve) {
                  newVotes = [...witnessVotes, theWitness];
                } else {
                  newVotes = witnessVotes.filter(x => x !== theWitness);
                }

                this.setState({ witnessVotes: newVotes });
                this.fetchVotedWitnesses();
              }}
            />
          );
        }
      },
      {
        title: (
          <span className="witness-column-title">
            <FormattedMessage id="witnesses.witness" />
          </span>
        ),
        dataIndex: 'name',
        render: text => (
          <QuickProfile {...this.props} username={text} reputation={0}>
            <div className="witness-card">
              <UserAvatar user={text} size="large" />
              <span className="username">{text}</span>
            </div>
          </QuickProfile>
        )
      },
      {
        title: <FormattedMessage id="witnesses.miss" />,
        dataIndex: 'miss',
        width: 100,
        render: text => intl.formatNumber(text)
      },
      {
        title: <FormattedMessage id="witnesses.url" />,
        width: 100,
        render: (text, record) => {
          const { parsedUrl } = record;

          if (parsedUrl) {
            return (
              <EntryLink
                {...this.props}
                author={parsedUrl.author}
                permlink={parsedUrl.permlink}
              >
                <a
                  target="_external"
                  href={parsedUrl.url}
                  className="witness-link"
                >
                  <i className="mi">link</i>
                </a>
              </EntryLink>
            );
          }

          return (
            <a target="_external" href={record.url} className="witness-link">
              <i className="mi">link</i>
            </a>
          );
        }
      },
      {
        title: <FormattedMessage id="witnesses.fee" />,
        width: 100,
        dataIndex: 'fee'
      },
      {
        title: <FormattedMessage id="witnesses.feed" />,
        dataIndex: 'feed',
        width: 140,
        render: text => <span className="feed-price">${text}</span>
      },
      {
        title: <FormattedMessage id="witnesses.version" />,
        dataIndex: 'version',
        width: 140,
        render: text => <span className="version-num">{text}</span>
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
        <div className="app-content witnesses-page">
          <div className={`page-header ${loading ? 'loading' : ''}`}>
            <div className="main-title">
              <FormattedMessage id="witnesses.page-title" />
            </div>
            {!loading && !proxy && activeAccount && (
              <div className="remaining">
                <FormattedHTMLMessage
                  id="witnesses.remaining"
                  values={{ n: 30 - witnessVotes.length, max: 30 }}
                />
              </div>
            )}
          </div>
          {loading && <LinearProgress />}
          {!loading && !proxy && (
            <Fragment>
              <div className="witnesses-table">
                <Table columns={columns} dataSource={witnesses} />
              </div>
              <div className="extra-funcs">
                <ExtraWitnesses
                  {...this.props}
                  list={extraWitnesses}
                  onChange={this.fetchVotedWitnesses}
                />
                <Proxy {...this.props} onChange={() => this.load()} />
              </div>
            </Fragment>
          )}

          {!loading && proxy && (
            <ProxyActive
              {...this.props}
              username={proxy}
              onChange={() => this.load()}
            />
          )}
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
