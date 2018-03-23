import steem from 'steem';
import {openSCDialog} from '../helpers/sc';

export default ($scope, $rootScope, $timeout, $location, $uibModalInstance, $q, $window, $filter, steemService, storageService, userService, activeUsername, loginMessage, afterLogin, onOpen) => {

  onOpen();

  $scope.loginMessage = loginMessage;

  $scope.formData = {
    username: storageService.get('last_username') ? storageService.get('last_username').trim() : '',
    code: ''
  };

  $scope.isLoginButtonVisible = () => {
    return $scope.formData.username.trim().length > 0 && $scope.formData.code.trim().length > 0
  };

  $scope.loginClicked = () => {
    $scope.loginErr = false;
    $scope.loginErrPublicKey = false;
    $scope.loginSuccess = false;

    let username = $scope.formData.username.trim();
    let code = $scope.formData.code.trim();

    // Save username entered to auto fill next time
    storageService.set('last_username', username);

    // Warn user if entered a public key
    if (steem.auth.isPubkey(code)) {
      $scope.loginErrPublicKey = true;
      return false;
    }

    // True if the code entered is password else false
    let codeIsPassword = !steem.auth.isWif(code);

    $scope.processing = true;

    steemService.getAccounts([username]).then((r) => {

      // User not found
      if (r && r.length === 0) {
        $scope.loginErr = true;
        return false;
      }

      let rUser = r[0];

      // Public keys of user
      let rUserPublicKeys = {
        active: rUser['active'].key_auths[0][0],
        memo: rUser['memo_key'],
        owner: rUser['owner'].key_auths[0][0],
        posting: rUser['posting'].key_auths[0][0]
      };

      let loginFlag = false;
      let resultKeys = {active: null, memo: null, owner: null, posting: null};

      if (codeIsPassword) {
        // With password

        // Get all private keys by username and password
        let username = rUser.name;
        let userKeys = steem.auth.getPrivateKeys(username, code);

        // Compare remote user keys and generated keys
        for (let k  in rUserPublicKeys) {
          let k2 = `${k}Pubkey`;

          let v = rUserPublicKeys[k];
          let v2 = userKeys[k2];

          // Append matched keys to result dict
          if (v === v2) {
            loginFlag = true;
            resultKeys[k] = userKeys[k];
          }
        }

      } else {
        // With wif
        let publicWif = steem.auth.wifToPublic(code);

        for (let k  in rUserPublicKeys) {
          let v = rUserPublicKeys[k];
          if (v === publicWif) {
            loginFlag = true;
            resultKeys[k] = code;
            break;
          }
        }
      }

      if (!loginFlag) {
        $scope.loginErr = true;
        return false;
      }

      let username = rUser.name;

      $scope.loginSuccess = true;

      userService.add(username, resultKeys);
      afterLoginLocal(username);

      $timeout(() => {
        $uibModalInstance.dismiss('cancel');

      }, 800);

    }).catch((e) => {
      console.log(e)
      // TODO: Handle error
    }).then(() => {
      $scope.processing = false;
    });
  };

  $scope.cancel = () => {
    $uibModalInstance.dismiss('cancel');
  };

  // Flag to prevent reopen steemconnect dialog window
  let scWindowFlag = true;
  $scope.loginWith = () => {

    if (!scWindowFlag) {
      return false;
    }

    scWindowFlag = false;

    openSCDialog((accessToken, username, expiresIn) => {

      $scope.loginSuccess = true;
      $scope.$apply();

      userService.addSc(username, accessToken, expiresIn);
      afterLoginLocal(username);

      setTimeout(() => {
        // $uibModalInstance.close(cb) not working properly.
        // Close modal by clicking backdrop element.
        document.querySelector('.modal-open div.in').click();

      }, 800);
    }, () => {
      scWindowFlag = true;
    });
  };

  const afterLoginLocal = (username) => {
    userService.setActive(username);
    $rootScope.$broadcast('userLoggedIn');
    $uibModalInstance.dismiss('cancel');
    afterLogin(username);
  };

  const loadAccounts = () => {
    $scope.accounts = userService.getAll();
    $scope.activeUsername = activeUsername();
  };

  loadAccounts();

  $scope.accountLoginClicked = (account) => {
    afterLoginLocal(account.username);
  };

  $scope.accountLogoutClicked = () => {
    userService.setActive(null);
    $rootScope.$broadcast('userLoggedOut');
  };

  $scope.accountRemoveClicked = (account) => {
    if (activeUsername() === account.username) {
      return false;
    }

    if ($window.confirm($filter('translate')('ARE_YOU_SURE'))) {
      userService.remove(account.username);
      loadAccounts();
    }
  };

  $rootScope.$on('userLoggedOut', () => {
    loadAccounts();
  });

  $rootScope.$on('userLoggedIn', () => {
    loadAccounts();
  });

  // Focus on user name field if account list is empty
  if ($scope.accounts.length === 0) {
    $timeout(function () {
      let i = document.querySelector('#login-username');
      if ($scope.formData.username !== '') {
        i = document.querySelector('#login-code');
      }
      if (i) {
        i.focus();
      }
    }, 800);
  }
};
