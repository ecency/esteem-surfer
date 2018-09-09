// @flow
/* eslint-disable jsx-a11y/anchor-has-content */

import React, { Component } from 'react';
import { Tooltip } from 'antd';

import Mi from '../elements/Mi';

type Props = {
  history: {},
  location: {},
  selectedFilter: string,
  changeThemeFn: () => void,
  reloadFn: () => void,
  reloading: boolean,
  favoriteFn?: () => void,
  favoriteFlag?: boolean,
  bookmarkFn?: () => void,
  bookmarkFlag?: boolean,
  postBtnActive?: boolean
};

export const checkPathForBack = path => {
  if (!path) {
    return false;
  }

  return !['/', '/welcome', '/set-pin'].includes(path);
};

export default class NavBar extends Component<Props> {
  props: Props;

  static defaultProps = {
    favoriteFn: undefined,
    favoriteFlag: false,

    bookmarkFn: undefined,
    bookmarkFlag: false,

    postBtnActive: false
  };

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

  favorite = () => {
    const { favoriteFn } = this.props;

    favoriteFn();
  };

  bookmark = () => {
    const { bookmarkFn } = this.props;

    bookmarkFn();
  };

  changeTheme = () => {
    const { changeThemeFn } = this.props;

    changeThemeFn();
  };

  logoClicked = () => {
    const { location, selectedFilter } = this.props;
    const newLoc = `/${selectedFilter}`;

    if (newLoc === location.pathname) {
      document.querySelector('#app-content').scrollTop = 0;
      return;
    }

    const { history } = this.props;
    history.push(newLoc);
  };

  render() {
    const {
      history,
      reloading,
      favoriteFn,
      favoriteFlag,
      bookmarkFn,
      bookmarkFlag,
      postBtnActive
    } = this.props;

    let canGoBack = false;
    if (history.entries[history.index - 1]) {
      canGoBack = checkPathForBack(history.entries[history.index - 1].pathname);
    }

    const curPath = history.entries[history.index].pathname;
    const canGoForward = !!history.entries[history.index + 1];

    const backClassName = `back ${!canGoBack ? 'disabled' : ''}`;
    const forwardClassName = `forward ${!canGoForward ? 'disabled' : ''}`;
    const reloadClassName = `reload ${reloading ? 'disabled' : ''}`;

    return (
      <div className="nav-bar">
        <div className="nav-bar-inner">
          <a
            onClick={() => {
              this.logoClicked();
            }}
            className="logo"
            role="none"
            tabIndex="-1"
          />
          <div className={`btn-post-mini  ${postBtnActive ? 'visible' : ''}`}>
            <span className="icon">
              <Mi icon="edit" />
            </span>
          </div>
          <div className="nav-controls">
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
          <div className="address-bar">
            <div className="pre-add-on">
              <Mi icon="search" />
            </div>
            <div className="address">
              <span className="protocol">esteem://</span>
              <span className="url">{curPath.replace('/', '')}</span>
            </div>
            {favoriteFn ? (
              <a
                className={`post-add-on ${!favoriteFlag ? 'disabled' : ''}`}
                onClick={e => this.favorite(e)}
                role="none"
              >
                <Mi icon="star_border" />
              </a>
            ) : (
              ''
            )}
            {bookmarkFn ? (
              <a
                className={`post-add-on ${!bookmarkFlag ? 'disabled' : ''}`}
                onClick={e => this.bookmark(e)}
                role="none"
              >
                <Mi icon="bookmark" />
              </a>
            ) : (
              ''
            )}
          </div>
          <div className="alt-controls">
            <a
              className="switch-theme"
              onClick={() => {
                this.changeTheme();
              }}
              role="none"
            >
              <Mi icon="brightness_medium" />
            </a>
          </div>
          <div className="user-menu">
            <Tooltip
              title="Login to you account"
              placement="left"
              mouseEnterDelay={2}
            >
              <a className="login">
                <Mi icon="account_circle" />
              </a>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  }
}
