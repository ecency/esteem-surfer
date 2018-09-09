// @flow

import React, { Component } from 'react';

type Props = {
  listStyle: string,
  changeStyleFn: () => void
};

export default class ListSwitch extends Component<Props> {
  props: Props;

  changeStyle = () => {
    const { changeStyleFn } = this.props;

    changeStyleFn();
  };

  render() {
    const { listStyle } = this.props;

    return (
      <a
        className={`list-switch ${listStyle === 'grid' ? 'active' : ''}`}
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
