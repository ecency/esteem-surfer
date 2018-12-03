import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Compose from '../components/Compose';
import { fetchEntries, invalidateEntries } from '../actions/entries';

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
import { setVisitingEntry } from '../actions/visiting-entry';
import { fetchActivities, resetActivities } from '../actions/activities';

const mapStateToProps = state => ({
  global: state.global,
  trendingTags: state.trendingTags,
  activeAccount: state.activeAccount,
  accounts: state.accounts,
  activities: state.activities
});

const mapDispatchToProps = dispatch => ({
  actions: {
    ...bindActionCreators({ fetchEntries, invalidateEntries }, dispatch),
    ...bindActionCreators(
      {
        changeTheme,
        changeListStyle,
        changeCurrency,
        changeLocale,
        changePushNotify,
        changeServer
      },
      dispatch
    ),
    ...bindActionCreators(
      {
        addAccount,
        addAccountSc,
        deleteAccount
      },
      dispatch
    ),
    ...bindActionCreators({ logIn, logOut, updateActiveAccount }, dispatch),
    ...bindActionCreators({ setVisitingEntry }, dispatch),
    ...bindActionCreators({ fetchActivities, resetActivities }, dispatch)
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Compose);
