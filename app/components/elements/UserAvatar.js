// @flow
import React, { Component } from 'react';

type Props = {
  user: string,
  size: string
};

export default class UserAvatar extends Component<Props> {
  props: Props;

  render() {
    const { user, size } = this.props;
    const imgSize = size === 'xLarge' ? 'large' : 'medium';
    const cls = `user-avatar ${size}`;

    return (
      <span
        className={cls}
        style={{
          backgroundImage: `url('https://steemitimages.com/u/${user}/avatar/${imgSize}')`
        }}
      />
    );
  }
}
