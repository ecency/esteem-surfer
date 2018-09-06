// @flow
/* eslint-disable jsx-a11y/anchor-has-content */

import React, { Component } from 'react';
import { Tooltip } from 'antd';
import { FormattedMessage } from 'react-intl';

import styles from './Navbar.less';
import Mi from '../elements/Mi';

type Props = {
  selectedFilter: string,
  history: {},
  location: {},
  reloadFn: () => *,
  reloading: boolean
};

export const checkPathForBack = path => {
  if (!path) {
    return false;
  }

  return !['/', '/welcome', '/set-pin'].includes(path);
};

export default class NavBar extends Component<Props> {
  props: Props;

  constructor(props: Props) {
    super(props);

    this.state = { miniBtnVisible: false };
    this.detectScroll = this.detectScroll.bind(this);
  }

  componentDidMount() {
    this.scrollEl = document.querySelector('#scrollMain');
    if (this.scrollEl) {
      this.scrollEl.addEventListener('scroll', this.detectScroll);
    }
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props;

    if (location !== prevProps.location) {
      this.detectScroll();
    }
  }

  componentWillUnmount() {
    if (this.scrollEl) {
      this.scrollEl.removeEventListener('scroll', this.detectScroll);
    }
  }

  detectScroll() {
    this.setState({
      miniBtnVisible: this.scrollEl.scrollTop >= 40
    });
  }

  goBack = () => {
    const { history } = this.props;

    history.goBack();
  };

  goForward = () => {
    const { history } = this.props;

    history.goForward();
  };

  refresh = () => {
    const { reloadFn } = this.props;

    reloadFn();
  };

  logoClicked = () => {
    const { location, selectedFilter } = this.props;
    const newLoc = `/${selectedFilter}`;

    if (newLoc === location.pathname) {
      document.querySelector('#scrollMain').scrollTop = 0;
      return;
    }

    const { history } = this.props;
    history.push(newLoc);
  };

  render() {
    const { history, reloading } = this.props;

    let canGoBack = false;
    if (history.entries[history.index - 1]) {
      canGoBack = checkPathForBack(history.entries[history.index - 1].pathname);
    }

    const curPath = history.entries[history.index].pathname;
    const canGoForward = !!history.entries[history.index + 1];

    const backClassName = `${styles.back} ${!canGoBack ? styles.disabled : ''}`;
    const forwardClassName = `${styles.forward} ${
      !canGoForward ? styles.disabled : ''
    }`;
    const reloadClassName = `${styles.reload} ${
      reloading ? styles.disabled : ''
    }`;

    const { miniBtnVisible } = this.state;

    return (
      <div className={styles.navBar}>
        <div
          className={`${styles.btnPost}  ${
            !miniBtnVisible ? styles.visible : ''
          }`}
        >
          <span className={styles.icon}>
            <Mi icon="edit" />
          </span>
          <FormattedMessage id="g.create-post" />
        </div>

        <div className={styles.navBarInner}>
          <a
            onClick={() => {
              this.logoClicked();
            }}
            className={styles.logo}
            role="none"
            tabIndex="-1"
          />
          <div
            className={`${styles.btnPostMini}  ${
              miniBtnVisible ? styles.visible : ''
            }`}
          >
            <span className={styles.icon}>
              <Mi icon="edit" />
            </span>
          </div>
          <div className={styles.navControls}>
            <a
              className={backClassName}
              onClick={e => this.goBack(e)}
              role="none"
            >
              <Mi icon="arrow_back" />
            </a>
            <a
              className={forwardClassName}
              onClick={e => this.goForward(e)}
              role="none"
            >
              <Mi icon="arrow_forward" />
            </a>
            <a
              className={reloadClassName}
              onClick={e => this.refresh(e)}
              role="none"
            >
              <Mi icon="refresh" />
            </a>
          </div>
          <div className={styles.addressBar}>
            <div className={styles.preAddOn}>
              <Mi icon="search" />
            </div>
            <div className={styles.address}>
              <span className={styles.protocol}>esteem://</span>
              <span className={styles.url}>{curPath.replace('/', '')}</span>
            </div>
            <div className={styles.postAddOn}>
              <Mi icon="star_border" />
            </div>
          </div>
          <div className={styles.altControls}>
            <a className={styles.switchTheme}>
              <Mi icon="brightness_medium" />
            </a>
          </div>
          <div className={styles.userMenu}>
            <Tooltip
              title="Login to you account"
              placement="left"
              mouseEnterDelay={2}
            >
              <a className={styles.login}>
                <Mi icon="account_circle" />
              </a>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  }
}
