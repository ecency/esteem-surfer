import React, { Component } from 'react';

export default class EntryListLoadingItem extends Component {
  render() {
    return [...Array(6).keys()].map(d => (
      <div className="entry-list-loading-item" key={d}>
        <div className="item-header" />
        <div className="item-body">
          <div className="item-image" />
          <div className="item-summary">
            <div className="item-title" />
            <div className="item-body" />
          </div>
          <div className="item-controls">
            <div className="voting" />
            <div className="total-payout" />
            <div className="voters" />
            <div className="comments" />
            <div className="app" />
          </div>
        </div>
      </div>
    ));
  }
}
