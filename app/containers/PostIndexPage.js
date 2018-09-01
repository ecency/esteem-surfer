import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PostIndex from '../components/PostIndex';
import { fetchPosts, invalidatePosts } from '../actions/posts';
import { fetchTrendingTags } from '../actions/trending-tags';

function mapStateToProps(state) {
  return {
    selectedFilter: state.global.selectedFilter,
    selectedTag: state.global.selectedTag,
    posts: state.posts,
    trendingTags: state.trendingTags
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({ fetchPosts, invalidatePosts }, dispatch),
      ...bindActionCreators({ fetchTrendingTags }, dispatch)
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PostIndex);
