// @flow
import { Component } from 'react';

type Props = {
  history: {}
};

export default class HomePage extends Component<Props> {
  props: Props;

  componentWillMount() {
    const { history } = this.props;
    history.push('/trending');
  }

  render() {
    return '<span />';
  }
}
