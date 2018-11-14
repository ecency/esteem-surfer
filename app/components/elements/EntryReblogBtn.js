import React, { Component, Fragment } from 'react';

import PropTypes from 'prop-types';

import { injectIntl } from 'react-intl';
import { Tooltip, Popconfirm, message } from 'antd';

import LoginRequired, { checkLogin } from '../helpers/LoginRequired';
import formatChainError from '../../utils/format-chain-error';
import { getItem, setItem } from '../../helpers/storage';
import { reblog } from '../../backend/steem-client';

class EntryReblogBtn extends Component {
  markAsReblogged = () => {
    const { activeAccount, entry } = this.props;
    const { author, permlink } = entry;

    setItem(`${activeAccount.username}-${author}-${permlink}-reblogged`, 1);
  };

  isReblogged = () => {
    const { activeAccount, entry } = this.props;

    const { author, permlink } = entry;

    if (
      getItem(`${activeAccount.username}-${author}-${permlink}-reblogged`) === 1
    ) {
      return true;
    }

    if (!activeAccount.accountData) {
      return false;
    }
    const { blog } = activeAccount.accountData;

    if (blog.some(e => e.author === author && e.permlink === permlink)) {
      this.markAsReblogged();
      return true;
    }

    return false;
  };

  doReblog = () => {
    const { activeAccount, global, entry, intl } = this.props;

    return reblog(activeAccount, global.pin, entry.author, entry.permlink)
      .then(resp => {
        message.success(intl.formatMessage({ id: 'entry-reblog.reblogged' }));
        this.markAsReblogged();
        return resp;
      })
      .catch(e => {
        message.error(formatChainError(e));
        if (
          e.jse_shortmsg &&
          String(e.jse_shortmsg).indexOf('has already reblogged')
        ) {
          // already blogged
          this.markAsReblogged();
        }
      })
      .finally(() => {
        this.forceUpdate();
      });
  };

  render() {
    const { entry, activeAccount, intl } = this.props;

    if (!activeAccount) {
      return (
        <Fragment>
          <LoginRequired {...this.props} requiredKeys={['posting']}>
            <a className="reblog">
              <Tooltip
                title={intl.formatMessage({ id: 'entry-reblog.reblog' })}
                mouseEnterDelay={2}
              >
                <i className="mi">repeat</i>
              </Tooltip>
            </a>
          </LoginRequired>
        </Fragment>
      );
    }

    const ownEntry =
      activeAccount !== null && activeAccount.username !== entry.author;
    if (!ownEntry) {
      return null;
    }

    const reblogged = this.isReblogged();
    const isLoginOk = checkLogin(activeAccount, ['posting']);
    const btnCls = `reblog ${reblogged ? 'reblogged' : ''}`;

    if (!isLoginOk) {
      return (
        <Fragment>
          <LoginRequired {...this.props} requiredKeys={['posting']}>
            <a className={btnCls}>
              <Tooltip
                title={intl.formatMessage({ id: 'entry-reblog.reblog' })}
                mouseEnterDelay={2}
              >
                <i className="mi">repeat</i>
              </Tooltip>
            </a>
          </LoginRequired>
        </Fragment>
      );
    }

    return (
      <Fragment>
        <a className={btnCls}>
          <Popconfirm
            title={intl.formatMessage({ id: 'g.are-you-sure' })}
            onConfirm={() => {
              this.doReblog();
            }}
          >
            <Tooltip
              title={intl.formatMessage({ id: 'entry-reblog.reblog' })}
              mouseEnterDelay={2}
              visible={false}
            >
              <i className="mi">repeat</i>
            </Tooltip>
          </Popconfirm>
        </a>
      </Fragment>
    );
  }
}

EntryReblogBtn.defaultProps = {
  activeAccount: null
};

EntryReblogBtn.propTypes = {
  global: PropTypes.shape({
    pin: PropTypes.string
  }).isRequired,
  entry: PropTypes.shape({
    author: PropTypes.string.isRequired,
    permlink: PropTypes.string.isRequired
  }).isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  intl: PropTypes.instanceOf(Object).isRequired
};

export default injectIntl(EntryReblogBtn);
