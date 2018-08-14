// @flow
import React, {Component} from 'react';
import styles from './Navbar.less';
import Mi from './Mi'
import {Tooltip} from 'antd';
import {LOCATION_CHANGE} from 'react-router-redux'


type Props = {
    location: location
};

export default class NavBar extends Component<Props> {
    props: Props;

    handleGoBack = e => {
        const {history} = this.props;

        history.goBack();
    };

    render() {
        const {location, history, pathname} = this.props;


        const canGoBack = pathname.previous;

        console.log(pathname.previous)

        // Replace first / of location
        const path = location.pathname.replace('/', '');

        const backClassName = styles.back + (!canGoBack ? ' ' + styles.disabled : '');
        const forwardClassName = styles.forward + ' ' + styles.disabled;

        return (

            <div className={styles.navBar}>
                <div className={styles.navBarInner}>
                    <a className={styles.logo}/>
                    <div className={styles.navControls}>
                        <a className={backClassName} onClick={this.handleGoBack.bind(this)}>
                            <Mi icon="arrow_back"/>
                        </a>
                        <a className={forwardClassName}>
                            <Mi icon="arrow_forward"/>
                        </a>
                        <a className={styles.reload}>
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
                                {path}
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
                        <Tooltip title="Login to you account" placement="left" mouseEnterDelay={2}>
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
