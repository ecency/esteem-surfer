import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Promote from '../components/Promote';

import { updateEntry } from '../actions/entries';

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

import { fetchActivities, resetActivities } from '../actions/activities';

import { setVisitingAccount } from '../actions/visiting-account';

import { setVisitingEntry } from '../actions/visiting-entry';

const mapStateToProps = state => ({
  global: state.global,
  accounts: state.accounts,
  activeAccount: state.activeAccount,
  dynamicProps: state.dynamicProps,
  activities: state.activities
});

const mapDispatchToProps = dispatch => ({
  actions: {
    ...bindActionCreators({ updateEntry }, dispatch),
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
        deleteAccount
      },
      dispatch
    ),
    ...bindActionCreators(
      { logIn, logOut, updateActiveAccount, deleteAccounts },
      dispatch
    ),
    ...bindActionCreators({ setVisitingEntry }, dispatch),
    ...bindActionCreators({ setVisitingAccount }, dispatch),
    ...bindActionCreators({ fetchActivities, resetActivities }, dispatch)
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Promote);
