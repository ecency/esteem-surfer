import steem from 'steem';

export default ($scope, $rootScope, $uibModalInstance, steemService) => {

  $scope.formData = {username: '', pass: '', postingKey: '', activeKey: ''};

  $scope.advanced = false;

  $scope.advancedClicked = () => {
    $scope.advanced = !$scope.advanced;
  };

  $scope.isLoginButtonVisible = () => {
    if ($scope.advanced) {
      return $scope.formData.username.trim().length > 0 &&
        ($scope.formData.postingKey.trim().length > 0 || $scope.formData.activeKey.trim().length > 0)
    } else {
      return $scope.formData.username.trim().length > 0 && $scope.formData.pass.trim().length > 0
    }
  };

  $scope.loginErr = false;
  $scope.loginSuccess = false;
  $scope.processing = false;

  $scope.loginClicked = () => {

    let roles = ['posting', 'active', 'owner'];
    let username = $scope.formData.username.trim();

    $scope.loginErr = false;
    $scope.loginSuccess = false;
    $scope.processing = true;

    steemService.getAccounts([username]).then((resp) => {

      if (resp && resp.length > 0) {
        let userData = resp[0];

        let wif = '';

        if (!$scope.advanced) {
          let pass = $scope.formData.pass.trim();
          wif = steem.auth.toWif(username, pass, roles[0]);
        } else {
          wif = steem.auth.isWif($scope.formData.postingKey) ? $scope.formData.postingKey : '';
        }

        let isWifValid = false;
        let publicWif = steem.auth.wifToPublic(wif);

        roles.map(function (role) {
          if (userData[role].key_auths[0][0] === publicWif) {
            isWifValid = true;
          }
        });

        if (!isWifValid) {
          $scope.loginErr = true;
          return false;
        }

      } else {
        $scope.loginErr = true;
      }
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
};
