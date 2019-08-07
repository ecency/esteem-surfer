/*
eslint-disable react/no-multi-comp
*/

import React, { Component } from 'react';

import PropTypes from 'prop-types';

import { FormattedMessage, FormattedRelative, injectIntl } from 'react-intl';

import { Popconfirm, Popover, message, Table, Modal, Badge } from 'antd';

import Tooltip from '../common/Tooltip';

import LoginRequired, { checkLogin } from '../helpers/LoginRequired';

import AccountLink from '../helpers/AccountLink';

import authorReputation from '../../utils/author-reputation';
import formatChainError from '../../utils/format-chain-error';

import { getItem, setItem } from '../../helpers/storage';

import { getAccounts, reblog } from '../../backend/steem-client';
import {
  getPostReblogCount,
  getPostReblogs
} from '../../backend/esteem-client';

class ReBloggersModal extends Component {
  render() {
    const { reblogs, onCancel, afterClose } = this.props;

    const modalTableColumns = [
      {
        dataIndex: 'account',
        key: 'account',
        render: (text, record) => (
          <span>
            <AccountLink {...this.props} username={text}>
              <span style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                {text}
              </span>
            </AccountLink>{' '}
            <Badge
              count={record.reputation}
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
        dataIndex: 'timestamp',
        key: 'timestamp',
        width: 220,
        render: text => (
          <span title={text}>
            <FormattedRelative value={text} />
          </span>
        )
      }
    ];

    return (
      <Modal
        visible
        onCancel={onCancel}
        afterClose={afterClose}
        footer={false}
        width="80%"
        centered
        showHeader={false}
        title={
          <FormattedMessage id="entry-reblog.modal-title" values={{ n: 11 }} />
        }
      >
        <Table
          dataSource={reblogs}
          columns={modalTableColumns}
          scroll={{ y: 310 }}
          showHeader={false}
          rowKey="id"
        />
      </Modal>
    );
  }
}

ReBloggersModal.defaultProps = {
  onCancel: () => {},
  afterClose: () => {}
};

ReBloggersModal.propTypes = {
  reblogs: PropTypes.arrayOf(Object).isRequired,
  onCancel: PropTypes.func,
  afterClose: PropTypes.func,
  intl: PropTypes.instanceOf(Object).isRequired
};

class EntryReblogBtn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      processing: false,
      reblogs: [],
      reblogCount: 0,
      reblogModal: false
    };
  }

  componentDidMount() {
    this.fetchReblogStuff();
  }

  fetchReblogStuff = () => {
    const { showDetail } = this.props;

    this.fetchReblogCount();

    if (showDetail) {
      this.fetchReblogs();
    }
  };

  fetchReblogCount = () => {
    const { entry } = this.props;

    return getPostReblogCount(entry.author, entry.permlink).then(r => {
      this.setState({ reblogCount: r });
      return r;
    });
  };

  fetchReblogs = () => {
    const { entry } = this.props;

    return getPostReblogs(entry.author, entry.permlink)
      .then(reblogs => {
        // Fetch account data from blockchain in order to get reputation.
        const ac = reblogs.map(a => a.account);
        return getAccounts(ac).then(accounts =>
          reblogs.map(v => {
            const account = accounts.find(a => a.name === v.account);
            if (account) {
              return Object.assign({}, v, {
                reputation: authorReputation(account.reputation),
                rep: account.rep
              });
            }
            return v;
          })
        );
      })
      .then(reblogs =>
        reblogs.sort((a, b) => {
          // Sort data by reputation
          const keyA = b.rep;
          const keyB = a.rep;

          if (keyA > keyB) return -1;
          if (keyA < keyB) return 1;
          return 0;
        })
      )
      .then(reblogs => this.setState({ reblogs }));
  };

  countClicked = () => {
    this.setState({ reblogModal: true });
  };

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

    if (
      blog &&
      blog.some(e => e.author === author && e.permlink === permlink)
    ) {
      return true;
    }

    return false;
  };

  doReblog = () => {
    const { activeAccount, global, entry, intl } = this.props;

    this.setState({ processing: true });

    return reblog(activeAccount, global.pin, entry.author, entry.permlink)
      .then(resp => {
        message.success(intl.formatMessage({ id: 'entry-reblog.reblogged' }));
        this.markAsReblogged();
        this.fetchReblogStuff();
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
        this.setState({ processing: false });
      });
  };

  render() {
    const { intl, entry, activeAccount, showDetail } = this.props;
    const { reblogs, reblogCount, reblogModal } = this.state;

    const aElems = [];

    if (reblogCount > 0) {
      const btnProps = {};
      if (showDetail && reblogs.length > 0) {
        btnProps.onClick = this.countClicked;
      }

      const btn = (
        <span
          role="none"
          key="count-btn"
          className="reblog-count"
          {...btnProps}
        >
          {reblogCount}
        </span>
      );

      if (reblogs.length > 0 && !reblogModal) {
        const accounts = reblogs.map(x => `@${x.account}`).slice(0, 3);
        const moreCount = reblogs.length - 3;
        let content = accounts.join(', ');

        if (moreCount > 0) {
          content = `${content} ${intl.formatMessage(
            { id: 'entry-reblog.more-reblogs' },
            { n: moreCount }
          )}`;
        }

        aElems.push(
          <Popover
            key="reblog-popover"
            content={content}
            trigger="hover"
            placement="right"
          >
            {btn}
          </Popover>
        );
      } else {
        aElems.push(btn);
      }
    }

    if (reblogModal) {
      aElems.push(
        <ReBloggersModal
          key="modal"
          {...this.props}
          reblogs={reblogs}
          onCancel={() => this.setState({ reblogModal: false })}
        />
      );
    }

    if (!activeAccount) {
      return (
        <div className="reblog-btn">
          <LoginRequired {...this.props} requiredKeys={['posting']}>
            <a className="inner-btn">
              <Tooltip
                title={intl.formatMessage({ id: 'entry-reblog.reblog' })}
                mouseEnterDelay={2}
              >
                <i className="mi">repeat</i>
              </Tooltip>
            </a>
          </LoginRequired>

          {aElems}
        </div>
      );
    }

    const ownEntry =
      activeAccount !== null && activeAccount.username !== entry.author;
    if (!ownEntry) {
      return null;
    }

    const { processing } = this.state;

    const reblogged = this.isReblogged();
    const isLoginOk = checkLogin(activeAccount, ['posting']);
    const btnCls = `reblog-btn${reblogged ? ' reblogged-btn' : ''}${
      processing ? ' processing' : ''
    }`;

    if (!isLoginOk) {
      return (
        <div className={btnCls}>
          <LoginRequired {...this.props} requiredKeys={['posting']}>
            <a className="inner-btn">
              <Tooltip
                title={intl.formatMessage({ id: 'entry-reblog.reblog' })}
                mouseEnterDelay={2}
              >
                <i className="mi">repeat</i>
              </Tooltip>
            </a>
          </LoginRequired>

          {aElems}
        </div>
      );
    }

    return (
      <div className={btnCls}>
        <a className="inner-btn">
          <Popconfirm
            title={intl.formatMessage({ id: 'g.are-you-sure' })}
            placement="right"
            onConfirm={() => {
              this.doReblog();
            }}
          >
            <Tooltip
              title={intl.formatMessage({ id: 'entry-reblog.reblog' })}
              mouseEnterDelay={2}
            >
              <i className="mi">repeat</i>
            </Tooltip>
          </Popconfirm>
        </a>

        {aElems}
      </div>
    );
  }
}

EntryReblogBtn.defaultProps = {
  activeAccount: null,
  showDetail: false
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
  showDetail: PropTypes.bool,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default injectIntl(EntryReblogBtn);
