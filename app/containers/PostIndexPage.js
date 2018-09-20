import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PostIndex from '../components/PostIndex';
import { fetchPosts, invalidatePosts } from '../actions/posts';
import { fetchTrendingTags } from '../actions/trending-tags';
import { changeTheme, changeListStyle } from '../actions/global';

function mapStateToProps(state) {
  return {
    global: state.global,
    posts: state.posts,
    trendingTags: state.trendingTags
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({ fetchPosts, invalidatePosts }, dispatch),
      ...bindActionCreators({ fetchTrendingTags }, dispatch),
      ...bindActionCreators({ changeTheme }, dispatch),
      ...bindActionCreators({ changeListStyle }, dispatch)
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PostIndex);
