// @flow
import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import routes from '../constants/routes.json';
import styles from './Home.css';

type Props = {};

export default class Home extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className={styles.container} data-tid="container">

        <div className="content-list">

        <div className="content-list-item">
          <div className="item-header">
            <span className="author-avatar" style={{backgroundImage: "url('https://steemitimages.com/u/eveuncovered/avatar/medium')" }}></span>
            <span className="author">eveuncovered <span className="author-reputation">72</span></span>

            <span className="content-category">photography</span>
            <span className="content-date">27 minutes ago</span>
          </div>
          <div className="item-body">
            <div className="item-image">
              <img
                src="https://steemitimages.com/0x0/https://cdn.steemitimages.com/DQmXAthCx6HxiA5B632V3c8FLyFsnZZyHjodH8dNAjmxCrb/cool1.jpg"/>
            </div>
            <div className="item-summary">
              <div className="item-title">Surfer 1.0.11 Update Brings Top Posts feature & more</div>
            </div>

          </div>
        </div>
        </div>
      </div>
    );
  }
}
