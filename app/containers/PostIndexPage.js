import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PostIndex from '../components/PostIndex';
import { fetchPosts, invalidatePosts } from '../actions/posts';
import { fetchTrendingTags } from '../actions/trending-tags';
import { changeTheme } from '../actions/global';

function mapStateToProps(state) {
  return {
    selectedFilter: state.global.selectedFilter,
    selectedTag: state.global.selectedTag,
    theme: state.global.theme,
    posts: state.posts,
    trendingTags: state.trendingTags
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({ fetchPosts, invalidatePosts }, dispatch),
      ...bindActionCreators({ fetchTrendingTags }, dispatch),
      ...bindActionCreators({ changeTheme }, dispatch)
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PostIndex);
