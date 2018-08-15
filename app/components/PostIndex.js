// @flow
import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {makeGroupKeyForPosts} from '../utils/misc';
import styles from './PostIndex.less';
import PostListItem from './elements/PostListItem'
import NavBar from './elements/NavBar'
import AppFooter from './elements/AppFooter'
import Mi from './elements/Mi'
import {Menu} from 'antd';
import DropDown from './elements/DropDown'
import filters from '../constants/filters.json'
import {FormattedMessage} from 'react-intl'


type Props = {
    fetchPosts: () => void,
    posts: {}
};

const makeFilterMenu = (active) => {
    return <Menu selectedKeys={[active]}>
        {
            filters.map((filter, idx) => {
                return <Menu.Item key={filter}>
                    <a href="#"><FormattedMessage id={`post-index.filter-${filter}`}/></a>
                </Menu.Item>
            })
        }
    </Menu>
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

        const filterMenu = makeFilterMenu(filter);


        return (
            <div className="wrapper">
                <NavBar  {...this.props}></NavBar>

                <div className="appContainer">
                    <div className={styles.side}>
                        <div className={styles.btnPost}>
                            <span className={styles.icon}><Mi icon="edit"/></span>
                            <FormattedMessage id="g.create-post" />
                        </div>

                        <div className={styles.tagList}>
                            <div className={styles.tagListHeader}>
                                <FormattedMessage id="post-index.tags"/>
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
                                    <span className={styles.label}>
                                        <FormattedMessage id={`post-index.filter-${filter}`}/>
                                    </span>
                                    <DropDown menu={filterMenu}/>
                                </div>
                                <a className={styles.listSwitch}>
                                    <Mi icon="view_module"/>
                                </a>
                            </div>

                            {postList.map(function (d, idx) {
                                // return (<PostListItem key={idx} content={d}></PostListItem>)
                            })}
                        </div>
                    </div>
                </div>

                <AppFooter></AppFooter>
            </div>
        );
    }
}
