// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';


type Props = {
    fetchPosts: () => void,
    groups: {}
};

export default class Post extends Component<Props> {
    props: Props;

    componentWillMount() {
        this.props.fetchPosts('trending');
    }


    render() {

        /*
        const {
            fetchContents,
            content
        } = this.props;
        */

        // console.log(this.props)
        return (
            <div> AAA

            </div>
        );
    }
}
