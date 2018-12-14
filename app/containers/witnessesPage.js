import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Witnesses from '../components/Witnesses';

import { updateEntry } from '../actions/entries';

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

import { setVisitingAccount } from '../actions/visiting-account';

import { setVisitingEntry } from '../actions/visiting-entry';

import { fetchActivities, resetActivities } from '../actions/activities';

const mapStateToProps = state => ({
  global: state.global,
  accounts: state.accounts,
  activeAccount: state.activeAccount,
  dynamicProps: state.dynamicProps,
  searchResults: state.searchResults,
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
    ...bindActionCreators({ setVisitingAccount }, dispatch),
    ...bindActionCreators({ fetchActivities, resetActivities }, dispatch)
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Witnesses);
