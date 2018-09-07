// @flow
import React, { Component } from 'react';

type Props = {
  icon: string,
  rotatedRight?: boolean
};

export default class Mi extends Component<Props> {
  props: Props;

  static defaultProps = {
    rotatedRight: false
  };

  render() {
    const { icon, rotatedRight } = this.props;

    const className = `mi ${rotatedRight ? 'rotated-right' : ''}`;

    return <i className={className}>{icon}</i>;
  }
}
