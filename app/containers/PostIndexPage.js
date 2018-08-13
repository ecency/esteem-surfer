import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PostIndex from '../components/PostIndex';
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
)(PostIndex);
