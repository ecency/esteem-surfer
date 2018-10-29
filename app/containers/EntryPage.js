import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import Entry from '../components/Entry';

import {
  changeTheme,
  changeListStyle,
  changeCurrency,
  changeLocale,
  changePushNotify,
  changeServer
} from '../actions/global';

import {addAccount, addAccountSc, deleteAccount} from '../actions/accounts';

import {logIn, logOut, updateActiveAccount} from '../actions/active-account';

const mapStateToProps = state => ({
  global: state.global,
  accounts: state.accounts,
  activeAccount: state.activeAccount,
  dynamicProps: state.dynamicProps,
  visitingEntry: state.visitingEntry
});

const mapDispatchToProps = dispatch => ({
  actions: {
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
    ...bindActionCreators({logIn, logOut, updateActiveAccount}, dispatch)
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Entry);
