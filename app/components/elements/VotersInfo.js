import React, {Component} from 'react';
import {FormattedMessage, FormattedRelative} from 'react-intl';
import {Popover, Modal, Table, Badge} from 'antd';

import parseMoney from '../../utils/parse-money';
import currencySymbol from '../../utils/currency-symbol';
import {getActiveVotes} from '../../steem_client';
import parseDate from '../../utils/parse-date';
import authorReputation from '../../utils/author-reputation'

type Props = {
  content: {},
  children: React.Node
};

export default class VotersInfo extends Component<Props> {
  props: Props;

  constructor(props: Props) {
    super(props);

    this.state = {modalVisible: false, hidePopover: false};
  }

  showModal = () => {
    this.setState({
      modalVisible: true,
      hidePopover: true
    });
  };

  handleOk = () => {
    this.setState({
      modalVisible: false
    });
  };

  handleCancel = () => {
    this.setState({
      modalVisible: false
    });
  };

  afterModalClosed = () => {
    this.setState({
      hidePopover: false
    });
  };

  render() {
    const {content, children} = this.props;

    const currency = 'usd';
    const currencyRate = 1;
    const curSymbol = currencySymbol(currency);

    const totalPayout =
      parseMoney(content.pending_payout_value) +
      parseMoney(content.total_payout_value) +
      parseMoney(content.curator_payout_value);

    const voteRshares = content.active_votes.reduce(
      (a, b) => a + parseFloat(b.rshares),
      0
    );
    const ratio = totalPayout / voteRshares;

    const votesData = content.active_votes
      .map(a => {
        const rew = a.rshares * ratio * currencyRate;

        return Object.assign(
          {},
          {
            reward: rew,
            perc: (a.percent / 100),
            time: parseDate(a.time),
            rep: authorReputation(a.reputation),
          },
          a
        );
      })
      .sort((a, b) => {
        const keyA = a.reward;
        const keyB = b.reward;

        if (keyA > keyB) return -1;
        if (keyA < keyB) return 1;
        return 0;
      });

    const popoverVotesData = votesData.slice(0, 10);
    const popoverVisible = votesData.length > 0;
    const more = content.active_votes.length - 10;

    const popoverChildren = popoverVotesData.map(v => (
      <p key={v.voter}>
        <span className="voter">{v.voter}</span>
        <span className="percent">{v.perc.toFixed(1)}</span>
        <span className="reward">
          {' '}
          {v.reward_fixed}
          {curSymbol}
        </span>
      </p>
    ));

    if (more > 0) {
      popoverChildren.push(
        <p key="more" className="more">
          <FormattedMessage id="voters-info.n-more" values={{n: more}}/>
        </p>
      );
    }

    const popoverContent = (
      <div className="voters-info-popover-content">{popoverChildren}</div>
    );

    const {hidePopover, modalVisible} = this.state;

    const popoverProps = {content: popoverContent};
    if (hidePopover) {
      popoverProps.visible = false;
    }


    const columns = [{
      title: 'Author',
      dataIndex: 'voter',
      key: 'voter',
      width: 220,
      sorter: (a, b) => a.rep - b.rep,
      render: (text, record) => {
        return <span>{text} <Badge count={record.rep} style={{
          backgroundColor: '#fff',
          color: '#999',
          boxShadow: '0 0 0 1px #d9d9d9 inset'
        }}/></span>

      }
    }, {
      title: 'Reward',
      dataIndex: 'reward',
      key: 'reward',
      align: 'center',
      width: 150,
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.reward - b.reward,
      render: (text, record) => {
        return text.toFixed(2);
      }
    }, {
      title: 'Percent',
      dataIndex: 'perc',
      key: 'percent',
      align: 'center',
      width: 150,
      sorter: (a, b) => a.perc - b.perc,
      render: (text, record) => {
        return text.toFixed(1);
      }
    }, {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      align: 'center',
      sorter: (a, b) => a.time - b.time,
      render: (text, record) => {
        return <FormattedRelative value={text}/>
      }
    }];


    if (popoverVisible) {
      return (
        <Popover {...popoverProps}>
          <span role="none" onClick={this.showModal}>
            {children}
          </span>

          <Modal
            visible={modalVisible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            afterClose={this.afterModalClosed}
            footer={false}
            width={"80%"}
            title="Voters info"
            centered={true}
          >
            <Table dataSource={votesData} columns={columns} scroll={{y: 300}}/>
          </Modal>
        </Popover>
      );
    }

    return children;
  }
}
