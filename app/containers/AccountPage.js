import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Account from '../components/Account';
import { fetchEntries, invalidateEntries, updateEntry } from '../actions/entries';

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

import {setVisitingEntry} from '../actions/visiting-entry';

const mapStateToProps = state => ({
  global: state.global,
  entries: state.entries,
  accounts: state.accounts,
  activeAccount: state.activeAccount,
  dynamicProps: state.dynamicProps,
  visitingAccount: state.visitingAccount
});

const mapDispatchToProps = dispatch => ({
  actions: {
    ...bindActionCreators({ fetchEntries, invalidateEntries, updateEntry }, dispatch),
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
    ...bindActionCreators({ setVisitingAccount }, dispatch),
    ...bindActionCreators({ setVisitingEntry }, dispatch)
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Account);
