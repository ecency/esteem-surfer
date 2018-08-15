import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PostIndex from '../components/PostIndex';
import * as ContentActions from '../actions/post';
import * as TrendingTagsActions from '../actions/trending-tags'

function mapStateToProps(state) {

    return {
        posts: state.post,
        pathname: state.pathname,
        trendingTags: state.trendingTags
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            post: bindActionCreators(ContentActions, dispatch),
            trendingTags: bindActionCreators(TrendingTagsActions, dispatch)
        }
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PostIndex);
