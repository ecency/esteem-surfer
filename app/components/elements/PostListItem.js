// @flow
import React, {Component} from 'react';
import styles from './PostListItem.less';

type Props = {
    content: object
};

export default class PostListItem extends Component<Props> {
    props: Props;

    render() {
        const c = this.props.content;

        return (
            <div className={styles.contentListItem}>
                <div className={styles.itemHeader}>
                    <span className={styles.authorAvatar} style={{backgroundImage: "url('https://steemitimages.com/u/good-karma/avatar/small')"}}/>
                    <span className={styles.author}>{ c.author } <span className={styles.authorReputation}>72</span></span>
                    <span className={styles.contentCategory}>{ c.parent_permlink }</span>
                    <span className={styles.contentDate}>27 minutes ago</span>
                </div>
                <div className={styles.itemBody}>
                    <div className={styles.itemImage}>
                        <img src="https://steemitimages.com/640x480/https://img.esteem.ws/mrmxb30k1c.png"/>
                    </div>
                    <div className={styles.itemSummary}>
                        <div className={styles.itemTitle}>{c.title}</div>
                        <div className={styles.itemBody}></div>
                    </div>
                </div>
            </div>
        );
    }
}
