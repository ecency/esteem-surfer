import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Account from '../components/Account';
import {
  fetchEntries,
  invalidateEntries,
  updateEntry
} from '../actions/entries';

import {
  changeTheme,
  changeListStyle,
  changeCurrency,
  changeLocale,
  changePushNotify,
  changeServer,
  wipePin
} from '../actions/global';

import {
  addAccount,
  addAccountSc,
  deleteAccount,
  deleteAccounts
} from '../actions/accounts';
import { logIn, logOut, updateActiveAccount } from '../actions/active-account';
import { setVisitingAccount } from '../actions/visiting-account';
import { setVisitingEntry } from '../actions/visiting-entry';
import { fetchActivities, resetActivities } from '../actions/activities';
import { tempSet } from '../actions/temp';

const mapStateToProps = state => ({
  global: state.global,
  entries: state.entries,
  accounts: state.accounts,
  activeAccount: state.activeAccount,
  dynamicProps: state.dynamicProps,
  visitingAccount: state.visitingAccount,
  activities: state.activities,
  marketData: state.marketData
});

const mapDispatchToProps = dispatch => ({
  actions: {
    ...bindActionCreators(
      { fetchEntries, invalidateEntries, updateEntry },
      dispatch
    ),
    ...bindActionCreators(
      {
        changeTheme,
        changeListStyle,
        changeCurrency,
        changeLocale,
        changePushNotify,
        changeServer,
        wipePin
      },
      dispatch
    ),
    ...bindActionCreators(
      {
        addAccount,
        addAccountSc,
        deleteAccount,
        deleteAccounts
      },
      dispatch
    ),
    ...bindActionCreators({ logIn, logOut, updateActiveAccount }, dispatch),
    ...bindActionCreators({ setVisitingAccount }, dispatch),
    ...bindActionCreators({ setVisitingEntry }, dispatch),
    ...bindActionCreators({ fetchActivities, resetActivities }, dispatch),
    ...bindActionCreators({ tempSet }, dispatch)
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Account);
