import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import Post from '../components/Post';
import * as ContentActions from '../actions/post';

function mapStateToProps(state) {
    return {
        posts: state.post
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ContentActions, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Post);
