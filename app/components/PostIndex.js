// @flow
import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {makeGroupKeyForPosts} from '../utils/misc';
import styles from './PostIndex.less';
import PostListItem from './elements/PostListItem'
import NavBar from './elements/NavBar'
import AppFooter from './elements/AppFooter'
import globalStyles from '../app.global.less'

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

                </div>
                <AppFooter></AppFooter>
            </div>
        );
    }
}
