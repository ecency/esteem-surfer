export default ($scope, $rootScope, $location, pinService) => {

  $scope.pin = '';

  $scope.isValid = () => {
    return $scope.pin.trim().length >= 4;
  };

  $scope.setPin = () => {
    if ($scope.isValid()) {
      pinService.setPin($scope.pin);
      $rootScope.pinCode = $scope.pin;
      $location.path('/');
    }
  }
}
