// @flow
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom'

type Props = {};

export default class HomePage extends Component<Props> {
  props: Props;

  render() {
      return <Redirect to='/trending' />;
  }
}
