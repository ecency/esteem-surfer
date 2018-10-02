import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import EntryIndex from '../components/EntryIndex';
import { fetchEntries, invalidateEntries } from '../actions/entries';
import { fetchTrendingTags } from '../actions/trending-tags';
import {
  changeTheme,
  changeListStyle,
  changeCurrency,
  changeLocale,
  changePushNotify,
  changeServer
} from '../actions/global';

import { addAccount, addAccountSc, deleteAccount } from '../actions/accounts';

import { logIn, logOut, updateActiveAccount } from '../actions/active-account';

function mapStateToProps(state) {
  return {
    global: state.global,
    entries: state.entries,
    trendingTags: state.trendingTags,
    accounts: state.accounts,
    activeAccount: state.activeAccount,
    dynamicProps: state.dynamicProps
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({ fetchEntries, invalidateEntries }, dispatch),
      ...bindActionCreators({ fetchTrendingTags }, dispatch),
      ...bindActionCreators({ changeTheme }, dispatch),
      ...bindActionCreators({ changeListStyle }, dispatch),
      ...bindActionCreators({ changeCurrency }, dispatch),
      ...bindActionCreators({ changeLocale }, dispatch),
      ...bindActionCreators({ changePushNotify }, dispatch),
      ...bindActionCreators({ changeServer }, dispatch),
      ...bindActionCreators(
        {
          addAccount,
          addAccountSc,
          deleteAccount
        },
        dispatch
      ),
      ...bindActionCreators({ logIn, logOut, updateActiveAccount }, dispatch)
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EntryIndex);
