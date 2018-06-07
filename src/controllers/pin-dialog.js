export default ($scope, $rootScope, $window, $location, $filter, $uibModalInstance, pinService, userService, cryptoService, cancelable) => {
  $rootScope.pinDialogOpen = true;

  $scope.cancelable = cancelable;

  $scope.code = '';
  $scope.tryCount = 0;
  $scope.maxTry = 5;

  $scope.check = () => {
    $scope.wrong = false;
    const h = pinService.getPinHash();
    const c = cryptoService.md5($scope.code);
    if (h === c) {
      $scope.close($scope.code);
      return;
    }

    $scope.wrong = true;
    $scope.tryCount += 1;

    // select textbox content if pincode wrong
    document.querySelector('#txt-pin-input').select();

    if ($scope.remainingTry() === 0) {
      $scope.invalidatePin();
      $rootScope.showError($filter('__')('PIN_INVALIDATED'));
    }
  };

  $scope.remainingTry = () => {
    return $scope.maxTry - $scope.tryCount;
  };

  $scope.keyPress = (e) => {
    if (e.which === 13 && $scope.isValid) {
      $scope.check();
    }
  };

  $scope.isValid = () => {
    return $scope.code.trim().length >= 1;
  };

  $scope.cancel = () => {
    $rootScope.pinDialogOpen = false;
    $uibModalInstance.dismiss('cancel');
  };

  $scope.close = (pinCode) => {
    $rootScope.pinDialogOpen = false;
    $uibModalInstance.close(pinCode);
  };

  $scope.invalidatePinClicked = () => {
    if ($window.confirm($filter('translate')('ARE_YOU_SURE'))) {
      $scope.invalidatePin();
      $rootScope.showSuccess($filter('__')('PIN_INVALIDATED'));
    }
  };

  $scope.invalidatePin = () => {
    // Remove users
    const users = userService.getAll();
    for (let u of users) {
      userService.remove(u.username);
    }

    // Logout
    userService.setActive(null);

    // Remove pin code
    pinService.removePin();

    // Close modal
    $scope.cancel();

    // Refersh app
    $window.location.href = $window.location.href.split('#!')[0];
  };
}
