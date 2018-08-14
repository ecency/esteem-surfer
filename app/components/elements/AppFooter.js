// @flow
import React, {Component} from 'react';
import styles from './AppFooter.less';
import {version} from '../../../package.json'


import batteryLogo from '../../img/ic_battery_60_48px.svg';

type Props = {};

export default class AppFooter extends Component<Props> {
    props: Props;

    render() {

        return (
            <div className={styles.appFooter}>
                <div className={styles.votingPower}>
                    <div className={styles.battery}>
                        <img src={batteryLogo}/>
                    </div>
                </div>
                <div className={styles.rightMenu}>
                    <a href="">FAQ</a>
                    <a href="">About</a>
                    <a href="" className={styles.version}>{version}</a>
                </div>
            </div>
        );
    }
}
