import steem from 'steem';

import {openSCDialog} from '../helpers/sc';


export default ($scope, $rootScope, $timeout, $uibModalInstance, steemService, userService, storageService) => {

  $scope.formData = {
    username: storageService.get('last_username'),
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

    storageService.set('last_username', username);

    if (steem.auth.isPubkey(code)) {
      $scope.loginErrPublicKey = true;
      return false;
    }

    // true if the code entered is password else false
    let codeIsPassword = !steem.auth.isWif(code);

    $scope.processing = true;

    steemService.getAccounts([username]).then((r) => {
      if (r && r.length === 0) {
        $scope.loginErr = true;
        return false;
      }

      let rUser = r[0];
      let rUserPublicKeys = {
        active: rUser['active'].key_auths[0][0],
        memo: rUser['memo_key'],
        owner: rUser['owner'].key_auths[0][0],
        posting: rUser['posting'].key_auths[0][0]
      };

      let loginFlag = false;
      let resultKeys = {active: null, memo: null, owner: null, posting: null};

      if (codeIsPassword) {

        // Get all private keys by username and password
        let userKeys = steem.auth.getPrivateKeys(username, code);

        // Compare remote user keys and generated keys
        for (let k  in rUserPublicKeys) {
          let k2 = `${k}Pubkey`;

          let v = rUserPublicKeys[k];
          let v2 = userKeys[k2];

          if (v === v2) {
            loginFlag = true;
            resultKeys[k] = userKeys[k];
          }
        }

      } else {
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

      let userId = rUser.id;
      let userName = rUser.name;

      userService.add(userId, userName, resultKeys);
      userService.setActive(userId);
      $rootScope.$broadcast('userLoggedIn');

      $scope.loginSuccess = true;

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

  let scWindowFlag = true;
  $scope.loginWith = () => {
    if (!scWindowFlag) {
      return;
    }
    scWindowFlag = false;
    openSCDialog((accessToken, username, expiresIn) => {
      console.log(accessToken, username, expiresIn);
    }, () => {
      scWindowFlag = true;
    });
  }

};
