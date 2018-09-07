// @flow
import React, { Component } from 'react';

type Props = {};

export default class LinearProgress extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className="linear-progress">
        <div className="bar bar1" />
        <div className="bar bar2" />
      </div>
    );
  }
}
