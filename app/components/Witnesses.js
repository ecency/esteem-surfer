import React, { Fragment, PureComponent } from 'react';

import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';


import { Table } from 'antd';


import NavBar from './layout/NavBar';
import AppFooter from './layout/AppFooter';
import DeepLinkHandler from './helpers/DeepLinkHandler';
import EntryLink from './helpers/EntryLink';
import AccountLink from './helpers/AccountLink';
import QuickProfile from './helpers/QuickProfile';

import UserAvatar from './elements/UserAvatar';

import { getWitnessesByVote } from '../backend/steem-client';

import parseToken from '../utils/parse-token';
import postUrlParser from '../utils/post-url-parser';


class Witnesses extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      witnesses: []
    };

  }

  componentDidMount() {
    this.fetchWitnesses();
  }

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

          <div className="witnesses-list">
            <div className="witnesses-list-header">
              <div className="list-title">Witness Voting</div>
            </div>
            <Table columns={columns} dataSource={witnesses} scroll={{ x: 1300 }} pagination={false} />
          </div>
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
  intl: PropTypes.instanceOf(Object).isRequired
};

export default injectIntl(Witnesses);