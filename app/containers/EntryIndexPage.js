import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import EntryIndex from '../components/EntryIndex';
import {fetchEntries, invalidateEntries} from '../actions/entries';
import {fetchTrendingTags} from '../actions/trending-tags';
import {changeTheme, changeListStyle, changeCurrency, changeLocale} from '../actions/global';

function mapStateToProps(state) {
  return {
    global: state.global,
    entries: state.entries,
    trendingTags: state.trendingTags
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({fetchEntries, invalidateEntries}, dispatch),
      ...bindActionCreators({fetchTrendingTags}, dispatch),
      ...bindActionCreators({changeTheme}, dispatch),
      ...bindActionCreators({changeListStyle}, dispatch),
      ...bindActionCreators({changeCurrency}, dispatch),
      ...bindActionCreators({changeLocale}, dispatch)
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EntryIndex);
