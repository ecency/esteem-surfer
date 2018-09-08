// @flow
import React, { Component } from 'react';

type Props = {};

export default class PostListLoadingItem extends Component<Props> {
  props: Props;

  render() {
    return [...Array(6).keys()].map(() => (
      <div className="post-list-loading-item">
        <div className="item-header" />
        <div className="item-body">
          <div className="item-image" />
          <div className="item-summary">
            <div className="item-title" />
            <div className="item-body" />
          </div>
          <div className="item-controls">
            <div className="voting" />
            <div className="post-total" />
            <div className="voters" />
            <div className="comments" />
            <div className="app" />
          </div>
        </div>
      </div>
    ));
  }
}
