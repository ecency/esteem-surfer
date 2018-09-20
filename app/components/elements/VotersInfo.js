import React, { Component } from 'react';
import { FormattedMessage, FormattedRelative } from 'react-intl';
import { Popover, Modal, Table, Badge } from 'antd';

import parseMoney from '../../utils/parse-money';
import currencySymbol from '../../utils/currency-symbol';
import parseDate from '../../utils/parse-date';
import authorReputation from '../../utils/author-reputation';

type Props = {
  content: {},
  children: React.Node
};

export const prepareContentVotes = (
  content: Object,
  currencyRate: number
): Array<Object> => {
  const totalPayout =
    parseMoney(content.pending_payout_value) +
    parseMoney(content.total_payout_value) +
    parseMoney(content.curator_payout_value);

  const voteRshares = content.active_votes.reduce(
    (a, b) => a + parseFloat(b.rshares),
    0
  );
  const ratio = totalPayout / voteRshares;

  return content.active_votes
    .map(a => {
      const rew = a.rshares * ratio * currencyRate;

      return Object.assign({}, a, {
        reputation: authorReputation(a.reputation),
        reward: rew,
        time: parseDate(a.time),
        percent: a.percent / 100
      });
    })
    .sort((a, b) => {
      const keyA = a.reward;
      const keyB = b.reward;

      if (keyA > keyB) return -1;
      if (keyA < keyB) return 1;
      return 0;
    });
};

export const preparePopoverContent = (votesData, curSymbol) => {
  const popoverVotesData = votesData.slice(0, 10);
  const moreCount = votesData.length - 10;

  const popoverChildren = popoverVotesData.map(v => (
    <p key={v.voter}>
      <span className="voter">{v.voter}</span>
      <span className="percent">{v.percent.toFixed(1)}</span>
      <span className="reward">
        {v.reward.toFixed(2)}
        {curSymbol}
      </span>
    </p>
  ));

  if (moreCount > 0) {
    popoverChildren.push(
      <p key="more" className="more">
        <FormattedMessage id="voters-info.n-more" values={{ n: moreCount }} />
      </p>
    );
  }

  return <div className="voters-info-popover-content">{popoverChildren}</div>;
};

export default class VotersInfo extends Component<Props> {
  props: Props;

  constructor(props: Props) {
    super(props);

    this.state = {
      modalVisible: false,
      hidePopover: false,
      popoverVisible: false
    };
  }

  popoverVisibleChanged(e) {
    this.setState({
      popoverVisible: e
    });
  }

  showModal = () => {
    this.setState({
      modalVisible: true,
      hidePopover: true
    });
  };

  handleModalCancel = () => {
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
    const { content, children } = this.props;
    const { hidePopover, modalVisible, popoverVisible } = this.state;

    let popoverProps = {};
    let votesData = [];

    if (popoverVisible) {
      const currency = 'usd';
      const currencyRate = 1;
      const curSymbol = currencySymbol(currency);

      votesData = prepareContentVotes(content, currencyRate);
      const popoverContent = preparePopoverContent(votesData, curSymbol);

      popoverProps = { content: popoverContent };
      if (hidePopover) {
        popoverProps.visible = false;
      }
    }

    if (content.active_votes.length > 0) {
      const modalTableColumns = [
        {
          title: <FormattedMessage id="voters-info.author" />,
          dataIndex: 'voter',
          key: 'voter',
          width: 220,
          sorter: (a, b) => a.reputation - b.reputation,
          render: (text, record) => (
            <span>
              {text}{' '}
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
          title: <FormattedMessage id="voters-info.reward" />,
          dataIndex: 'reward',
          key: 'reward',
          align: 'center',
          width: 150,
          defaultSortOrder: 'descend',
          sorter: (a, b) => a.reward - b.reward,
          render: text => text.toFixed(2)
        },
        {
          title: <FormattedMessage id="voters-info.percent" />,
          dataIndex: 'percent',
          key: 'percent',
          align: 'center',
          width: 150,
          sorter: (a, b) => a.percent - b.percent,
          render: text => text.toFixed(1)
        },
        {
          title: <FormattedMessage id="voters-info.time" />,
          dataIndex: 'time',
          key: 'time',
          align: 'center',
          sorter: (a, b) => a.time - b.time,
          render: text => <FormattedRelative value={text} />
        }
      ];

      return (
        <Popover
          onVisibleChange={e => {
            this.popoverVisibleChanged(e);
          }}
          {...popoverProps}
        >
          <span role="none" onClick={this.showModal}>
            {children}
          </span>

          <Modal
            visible={modalVisible}
            onCancel={this.handleModalCancel}
            afterClose={this.afterModalClosed}
            footer={false}
            width="80%"
            title={
              <FormattedMessage
                id="voters-info.modal-title"
                values={{ n: votesData.length }}
              />
            }
            centered
          >
            <Table
              dataSource={votesData}
              columns={modalTableColumns}
              scroll={{ y: 300 }}
            />
          </Modal>
        </Popover>
      );
    }

    // When content has no votes
    return children;
  }
}
