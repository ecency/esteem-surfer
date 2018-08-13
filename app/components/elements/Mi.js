// @flow
import React, {Component} from 'react';
import styles from './Mi.less';

type Props = {
    icon: string
};

export default class Mi extends Component<Props> {
    props: Props;

    render() {
        return (
            <i className={styles.mi}>{this.props.icon}</i>
        );
    }
}
