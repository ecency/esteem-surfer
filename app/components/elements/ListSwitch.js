// @flow

import React, { Component } from 'react';

type Props = {
  changeStyleFn: () => void
};

export default class ListSwitch extends Component<Props> {
  props: Props;

  changeStyle = () => {
    const { changeStyleFn } = this.props;

    changeStyleFn();
  };

  render() {
    return (
      <a
        className="list-switch"
        onClick={() => {
          this.changeStyle();
        }}
        role="none"
      >
        <i className="mi">view_module</i>
      </a>
    );
  }
}
