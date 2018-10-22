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

const mapStateToProps = state => ({
  global: state.global,
  trendingTags: state.trendingTags,
  activeAccount: state.activeAccount
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
    ...bindActionCreators({ logIn, logOut, updateActiveAccount }, dispatch)
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Compose);
