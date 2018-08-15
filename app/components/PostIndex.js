// @flow
import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {makeGroupKeyForPosts} from '../utils/misc';
import styles from './PostIndex.less';
import PostListItem from './elements/PostListItem'
import NavBar from './elements/NavBar'
import AppFooter from './elements/AppFooter'
import Mi from './elements/Mi'
import {Menu, Icon} from 'antd';
import DropDown from './elements/DropDown'


type Props = {
    fetchPosts: () => void,
    posts: {}
};

export default class PostIndex extends Component<Props> {
    props: Props;

    constructor(props) {
        super(props);
        this.goBack = this.goBack.bind(this);
    }

    startFetch = () => {
        const filter = this.props.match.params.filter;
        this.props.fetchPosts(filter);
        // console.log(filter)
    };

    componentDidMount() {
        this.startFetch()
    }

    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) {
            this.startFetch()
        }
    }

    goBack() {
        this.props.history.goBack();
    }




    render() {

        const filterMenu = (
            <Menu selectedKeys={['1']}>
                <Menu.Item key="0">
                    <a href="#">Trending</a>
                </Menu.Item>
                <Menu.Item key="1">
                    <a href="#">Hot</a>
                </Menu.Item>
                <Menu.Item key="2">
                    <a href="#">New</a>
                </Menu.Item>
                <Menu.Item key="3">
                    <a href="#">Active</a>
                </Menu.Item>
                <Menu.Item key="4">
                    <a href="#">Promoted</a>
                </Menu.Item>

            </Menu>
        );

        const {
            posts
        } = this.props;

        const filter = this.props.match.params.filter;
        const groupKey = makeGroupKeyForPosts(filter);

        const postList = [];

        let loading = true;

        if (posts.groups[groupKey] && !posts.groups[groupKey].loading) {
            loading = false;

            for (let id of posts.groups[groupKey].ids) {
                postList.push(posts.posts[id]);
            }
        }


        return (
            <div className="wrapper">
                <NavBar  {...this.props}></NavBar>
                <div className="appContainer">
                    <div className={styles.side}>
                        <div className={styles.btnPost}>
                            <span className={styles.icon}><Mi icon="edit"/></span>
                            Create Post
                        </div>

                        <div className={styles.tagList}>
                            <div className={styles.tagListHeader}>
                                Popular Tags
                            </div>
                            <a className={styles.tagListItem}>life</a>
                            <a className={styles.tagListItem}>photography</a>
                            <a className={styles.tagListItem}>kr</a>
                            <a className={styles.tagListItem}>esteem</a>
                            <a className={styles.tagListItem}>art</a>
                            <a className={styles.tagListItem}>bitcoin</a>
                            <a className={styles.tagListItem}>introduceyourself</a>
                            <a className={styles.tagListItem}>spanish</a>
                            <a className={styles.tagListItem}>travel</a>
                        </div>
                    </div>

                    <div className={styles.content}>
                        <div className={styles.postList}>
                            <div className={styles.postListHeader}>
                                <div className={styles.filterSelect}>
                                    <span className={styles.label}>Trending</span>
                                    <DropDown menu={filterMenu} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <AppFooter></AppFooter>
            </div>
        );
    }
}
