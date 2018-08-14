// @flow
import React, {Component} from 'react';
import styles from './Mi.less';

type Props = {
    icon: string,
    rotatedRight?: boolean
};

export default class Mi extends Component<Props> {
    props: Props;


    render() {
        const {rotatedRight} = this.props;

        let className = styles.mi;

        if (rotatedRight) className += ' ' + styles.miRotatedRight;

        return (
            <i className={className}>{this.props.icon}</i>
        );
    }
}
