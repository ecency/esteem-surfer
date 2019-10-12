import { bindActionCreators } from 'redux';

import { connect } from 'react-redux';

import Sps from '../components/Sps';

import { updateEntry } from '../actions/entries';

import { tempReset } from '../actions/temp';

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

const mapStateToProps = state => ({
  global: state.global,
  accounts: state.accounts,
  activeAccount: state.activeAccount,
  dynamicProps: state.dynamicProps,
  searchResults: state.searchResults,
  activities: state.activities,
  temp: state.temp
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
        deleteAccount,
        deleteAccounts
      },
      dispatch
    ),
    ...bindActionCreators({ logIn, logOut, updateActiveAccount }, dispatch),
    ...bindActionCreators({ setVisitingEntry }, dispatch),
    ...bindActionCreators({ setVisitingAccount }, dispatch),
    ...bindActionCreators({ fetchActivities, resetActivities }, dispatch),
    ...bindActionCreators({ tempReset }, dispatch)
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sps);
