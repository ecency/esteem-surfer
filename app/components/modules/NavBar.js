// @flow
import React, {Component} from 'react';
import styles from './Navbar.less';
import Mi from '../elements/Mi'
import {Tooltip} from 'antd';
import {Link} from 'react-router-dom'

type Props = {
    location: location,
    selectedFilter: string
};

export const checkPathForBack = (path) => {
    if (!path) {
        return false;
    }

    return !['/', '/welcome', '/set-pin'].includes(path)
};

export default class NavBar extends Component<Props> {
    props: Props;

    goBack = () => {
        const {history} = this.props;

        history.goBack();
    };

    goForward = () => {
        const {history} = this.props;

        history.goForward();
    };

    render() {

        const {history, selectedFilter} = this.props;

        let canGoBack = false;
        if (history.entries[history.index - 1]) {
            canGoBack = checkPathForBack(history.entries[history.index - 1].pathname);
        }

        const curPath = history.entries[history.index].pathname;
        const canGoForward = !!history.entries[history.index + 1];

        const backClassName = styles.back + (!canGoBack ? ' ' + styles.disabled : '');
        const forwardClassName = styles.forward + (!canGoForward ? ' ' + styles.disabled : '');

        return (

            <div className={styles.navBar}>
                <div className={styles.navBarInner}>
                    <Link to={`/${selectedFilter}`} className={styles.logo}/>
                    <div className={styles.navControls}>
                        <a className={backClassName} onClick={(e) => this.goBack(e)}>
                            <Mi icon="arrow_back"/>
                        </a>
                        <a className={forwardClassName} onClick={(e) => this.goForward(e)}>
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
                                {curPath.replace('/', '')}
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
