// @flow
import React, { Component } from 'react';
import styles from './LinearProgress.less';

type Props = {};

export default class Mi extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className={styles.linearProgress}>
        <div className={`${styles.bar} ${styles.bar1}`} />
        <div className={`${styles.bar} ${styles.bar2}`} />
      </div>
    );
  }
}
