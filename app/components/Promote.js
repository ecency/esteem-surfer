import React, { Fragment, PureComponent } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';

import PropTypes from 'prop-types';
import { AutoComplete, Button, Icon, message, Select, Slider } from 'antd';

import NavBar from './layout/NavBar';
import AppFooter from './layout/AppFooter';
import PinRequired from './helpers/PinRequired';
import SliderTooltip from './elements/SliderTooltip';
import LinearProgress from './common/LinearProgress';
import DeepLinkHandler from './helpers/DeepLinkHandler';

import { getContent, promote } from '../backend/steem-client';
import {
  getPoints,
  getPromotePrice,
  searchPath
} from '../backend/esteem-client';
import formatChainError from '../utils/format-chain-error';

class Transfer extends PureComponent {
  constructor(props) {
    super(props);

    this.state = this.resetState();
    this.timer = null;
  }

  componentDidMount() {
    this.init();

    window.addEventListener('user-login', this.init);
  }

  componentWillUnmount() {
    window.removeEventListener('user-login', this.init);
  }

  init = () => {
    this.setState({ loading: true });

    const { match, history, intl } = this.props;
    const { username } = match.params;

    const { accounts } = this.props;
    const account = accounts.find(x => x.username === username);

    if (!account) {
      history.push('/');
      return;
    }

    if (account.type === 's' && !account.keys.active) {
      this.setState({
        userError: intl.formatMessage({ id: 'promote.key-required-err' })
      });
    } else {
      this.setState({ userError: null });
    }

    this.setState(
      {
        user: username
      },
      () =>
        getPromotePrice()
          .then(resp => {
            // make sure order
            const priceList = resp.sort((a, b) => a.duration - b.duration);
            this.setState({ priceList, duration: priceList[1].duration });
            return getPoints(username);
          })
          .then(r => {
            this.setState({ userPoints: r.points }, () => {
              this.checkFunds();
            });
            return r;
          })
          .catch(() => {
            message.error(intl.formatMessage({ id: 'g.server-error' }));
          })
          .catch(e => {
            message.error(formatChainError(e));
          })
          .finally(() => {
            this.setState({ loading: false });
          })
    );

    if (match.params.author && match.params.permlink) {
      this.postChanged(`${match.params.author}/${match.params.permlink}`);
    }
  };

  resetState = () => ({
    user: null,
    userError: null,
    userPoints: '',
    postList: [],
    priceList: [],
    inProgress: false,
    loading: false,
    post: '',
    postError: null,
    duration: 1,
    fundsError: null,
    success: false
  });

  userChanged = user => {
    const { history } = this.props;

    const u = `/@${user}/promote`;
    history.push(u);
  };

  postChanged = v => {
    this.setState({ post: v, postError: null });

    if (this.timer) {
      clearTimeout(this.timer);
    }

    if (v.trim().length < 3) {
      this.setState({ postList: [] });
      return;
    }

    this.timer = setTimeout(
      () =>
        searchPath(v).then(resp => {
          this.setState({ postList: resp });
          return resp;
        }),
      500
    );
  };

  durationChanged = v => {
    this.setState({ duration: v }, () => {
      this.checkFunds();
    });
  };

  checkFunds = () => {
    const { intl } = this.props;
    const { duration } = this.state;

    const { priceList, userPoints } = this.state;
    const { price } = priceList.find(x => x.duration === duration);

    const r = parseFloat(userPoints) < price;
    this.setState({
      fundsError: r ? intl.formatMessage({ id: 'promote.funds-error' }) : null
    });
  };

  isValidPost = p => {
    if (p.indexOf('/') === -1) {
      return;
    }

    const [author, permlink] = p.replace('@', '').split('/');
    return author.length >= 3 && permlink.length >= 3;
  };

  postComponents = p => {
    const [author, permlink] = p.replace('@', '').split('/');
    return { author, permlink };
  };

  confirm = async pin => {
    const { accounts, intl } = this.props;
    const { user, post, duration } = this.state;
    const account = accounts.find(x => x.username === user);

    const { author, permlink } = this.postComponents(post);

    this.setState({ inProgress: true });

    let content;
    try {
      content = await getContent(author, permlink);
    } catch (e) {
      content = { id: 0 };
    }

    if (content.id === 0) {
      this.setState({
        postError: intl.formatMessage({ id: 'promote.post-error' })
      });
      this.setState({ inProgress: false });
      return;
    }

    return promote(account, pin, user, author, permlink, duration)
      .then(resp => {
        this.setState({ success: true });
        return resp;
      })
      .catch(err => {
        message.error(formatChainError(err));
      })
      .finally(() => {
        this.setState({ inProgress: false });
      });
  };

  render() {
    const { intl, accounts } = this.props;
    const {
      user,
      userError,
      userPoints,
      postList,
      priceList,
      post,
      postError,
      duration,
      fundsError,
      loading,
      inProgress,
      success
    } = this.state;

    const sliderMarks = {};
    let sliderMin;
    let sliderMax;
    let sliderPercentage = 0;
    let selectedPrice = '';

    if (priceList.length > 0) {
      sliderMin = priceList[0].duration;
      sliderMax = priceList[priceList.length - 1].duration;

      sliderPercentage =
        duration === sliderMin ? 0 : Math.ceil((duration / sliderMax) * 100);

      selectedPrice = priceList.find(x => x.duration === duration).price;

      priceList.forEach(i => {
        sliderMarks[i.duration] = ' ';
      });
    }

    const postOptions =
      postList.length > 0
        ? [
            <AutoComplete.OptGroup
              key="user-posts"
              label={intl.formatMessage({
                id: 'promote.post-input-title'
              })}
            >
              {postList.map(i => (
                <AutoComplete.Option key={i} value={`${i}`}>
                  {i}
                </AutoComplete.Option>
              ))}
            </AutoComplete.OptGroup>
          ]
        : [];

    const canSubmit =
      !userError && !postError && !fundsError && this.isValidPost(post);

    return (
      <div className="wrapper">
        <NavBar
          {...Object.assign({}, this.props, {
            reloadFn: () => {
              this.setState(this.resetState());
              this.init();
            },
            reloading: loading
          })}
        />
        <div className="app-content promote-page">
          <div className={`page-header ${loading ? 'loading' : ''}`}>
            <div className="main-title">
              <FormattedMessage id="promote.page-title" />
            </div>
          </div>
          {loading && <LinearProgress />}

          {success && (
            <div className="success">
              <p className="message">
                <i className="mi">check</i>{' '}
                <FormattedMessage id="promote.success-message" />
              </p>
              <p>
                <Button
                  type="primary"
                  onClick={() => {
                    const { history } = this.props;
                    history.push(`/@${user}/points`);
                  }}
                >
                  <FormattedMessage id="promote.go-back" />
                </Button>
              </p>
            </div>
          )}

          {!loading && !success && (
            <div className="promote-box">
              <div className="promote-form">
                <div
                  className={`form-item form-item-user ${
                    userError ? 'has-error' : ''
                  }`}
                >
                  <div className="form-label">
                    <FormattedMessage id="promote.user-label" />
                  </div>
                  <div className="form-input">
                    <Select
                      className="select-user"
                      onChange={this.userChanged}
                      defaultValue={user}
                      value={user}
                    >
                      {accounts.map(i => (
                        <Select.Option key={i.username} value={i.username}>
                          {i.username}
                        </Select.Option>
                      ))}
                    </Select>
                    <div
                      className="input-help available-funds"
                      title={intl.formatMessage({
                        id: 'promote.user-help-text'
                      })}
                    >
                      {userPoints} eSteem Points
                    </div>
                    {userError && <div className="input-help">{userError}</div>}
                  </div>
                </div>
                <div className={`form-item ${postError ? 'has-error' : ''}`}>
                  <div className="form-label">
                    <FormattedMessage id="promote.post-label" />
                  </div>
                  <div className="form-input">
                    <AutoComplete
                      autoFocus
                      onChange={this.postChanged}
                      onSelect={this.postChanged}
                      value={post}
                      placeholder={intl.formatMessage({
                        id: 'promote.post-input-placeholder'
                      })}
                      spellCheck={false}
                      dataSource={postOptions}
                      style={{ width: '100%' }}
                    />
                    {postError && <div className="input-help">{postError}</div>}
                  </div>
                </div>
                <div
                  className={`form-item form-item-duration ${
                    fundsError ? 'has-error' : ''
                  }`}
                >
                  <div className="form-label">
                    <FormattedMessage id="promote.duration-label" />
                  </div>
                  <div className="form-input">
                    <SliderTooltip
                      percentage={sliderPercentage}
                      value={
                        <Fragment>
                          {duration}&nbsp;
                          <FormattedMessage
                            id={`promote.${duration === 1 ? 'day' : 'days'}`}
                          />
                          <span className="slider-price">
                            &nbsp; {selectedPrice} eSteem points
                          </span>
                        </Fragment>
                      }
                    />
                    <Slider
                      min={sliderMin}
                      max={sliderMax}
                      step={null}
                      tooltipVisible={false}
                      value={duration}
                      disabled={false}
                      onChange={this.durationChanged}
                      marks={sliderMarks}
                    />
                    {!fundsError && (
                      <div className="input-help">
                        <FormattedMessage id="promote.duration-help" />
                      </div>
                    )}
                    {fundsError && (
                      <div className="input-help">{fundsError}</div>
                    )}
                  </div>
                </div>
                <div className="form-item">
                  <div className="form-label" />
                  <div className="form-input">
                    <PinRequired {...this.props} onSuccess={this.confirm}>
                      <Button
                        type="primary"
                        disabled={!canSubmit || inProgress}
                      >
                        {inProgress && (
                          <Icon type="loading" style={{ fontSize: 12 }} spin />
                        )}
                        <FormattedMessage id="promote.submit" />
                      </Button>
                    </PinRequired>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <AppFooter {...this.props} />
        <DeepLinkHandler {...this.props} />
      </div>
    );
  }
}

Transfer.defaultProps = {
  accounts: [],
  activeAccount: null
};

Transfer.propTypes = {
  activeAccount: PropTypes.instanceOf(Object),
  accounts: PropTypes.arrayOf(PropTypes.object),
  history: PropTypes.instanceOf(Object).isRequired,
  match: PropTypes.instanceOf(Object).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default injectIntl(Transfer);
