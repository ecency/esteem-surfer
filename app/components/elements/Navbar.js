// @flow
import React, {Component} from 'react';
import styles from './Navbar.less';
import Mi from './Mi'
import {Tooltip} from 'antd';


type Props = {
    location: location
};

export default class NavBar extends Component<Props> {
    props: Props;

    render() {
        const c = this.props.content;

        return (

            <div className={styles.navBar}>
                <div className={styles.navBarInner}>
                    <a className={styles.logo}/>
                    <div className={styles.navControls}>
                        <a className={styles.controlBack}>
                            <Mi icon="arrow_back"/>
                        </a>
                        <a className={styles.controlForward + ' ' + styles.disabled}>
                            <Mi icon="arrow_forward"/>
                        </a>
                        <a className={styles.controlReload}>
                            <Mi icon="refresh"/>
                        </a>
                    </div>
                    <div className={styles.addressBar}>
                        <div className={styles.preAddOn}>
                            <Mi icon="search"/>
                        </div>
                        <div className={styles.address}>
                            <span className={styles.protocol}>
                                esteem://
                            </span>
                            <span className={styles.url}>
                                trending/photography
                            </span>
                        </div>
                        <div className={styles.postAddOn}>
                            <Mi icon="star_border"/>
                        </div>
                    </div>
                    <div className={styles.altControls}>
                        <a className={styles.switchTheme}><Mi icon="brightness_medium"/></a>
                    </div>
                    <div className={styles.userMenu}>
                        <Tooltip title="Login to you account" placement="left" mouseEnterDelay="2">
                            <a className={styles.login}>
                                <Mi icon="account_circle"/>
                            </a>
                        </Tooltip>
                    </div>
                </div>
            </div>
        );
    }
}
