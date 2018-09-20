// @flow

import React, { Component } from 'react';

type Props = {
  actions: {
    changeListStyle: () => void
  },
  global: {}
};

export default class ListSwitch extends Component<Props> {
  props: Props;

  changeStyle = () => {
    const { actions } = this.props;

    actions.changeListStyle();
  };

  render() {
    const { global } = this.props;
    const { listStyle } = global;

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
