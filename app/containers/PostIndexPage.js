import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PostIndex from '../components/PostIndex';
import {fetchPosts} from '../actions/post';
import {fetchTrendingTags} from '../actions/trending-tags'

function mapStateToProps(state) {
    return {
        selectedFilter: state.global.selectedFilter,
        selectedTag: state.global.selectedTag,
        posts: state.post,
        pathname: state.pathname,
        trendingTags: state.trendingTags
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            ...bindActionCreators({fetchPosts}, dispatch),
            ...bindActionCreators({fetchTrendingTags}, dispatch)
        }
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PostIndex);
