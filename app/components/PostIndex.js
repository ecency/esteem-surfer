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
    actions: {},
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
        this.props.actions.post.fetchPosts(filter);
        // console.log(filter)

        this.props.actions.trendingTags.fetchTags();
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
            posts,
            trendingTags
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
                            <FormattedMessage id="g.create-post"/>
                        </div>

                        <div className={styles.tagList}>
                            <div className={styles.tagListHeader}>
                                <FormattedMessage id="post-index.tags"/>
                            </div>


                            {trendingTags.list.map(function (tag, idx) {
                                return ( <a className={styles.tagListItem} key={idx}>{tag}</a>)
                            })}


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
