import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PostIndex from '../components/PostIndex';
import { fetchPosts, invalidatePosts } from '../actions/posts';
import { fetchTrendingTags } from '../actions/trending-tags';
import { changeTheme, changeListStyle } from '../actions/global';

function mapStateToProps(state) {
  return {
    selectedFilter: state.global.selectedFilter,
    selectedTag: state.global.selectedTag,
    trendingTags: state.trendingTags,
    posts: state.posts,
    theme: state.global.theme,
    listStyle: state.global.listStyle
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
