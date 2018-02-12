export default ($scope, $rootScope, $timeout, $uibModalInstance, settingsService, eSteemService, constants) => {

  $scope.languages = constants.languages;
  $scope.currencies = constants.currencies;
  $scope.servers = constants.servers;

  $scope.language = settingsService.get('language');
  $scope.currency = settingsService.get('currency');
  $scope.server = settingsService.get('server');

  $scope.langState = 1;
  $scope.currState = 1;
  $scope.serverState = 1;
  $scope.nightState = 1;

  $scope.$watch('language', (newVal, oldVal) => {
    if (newVal === oldVal) {
      return false;
    }
    $scope.langState = 2;
    $timeout(() => {
      settingsService.set('language', newVal);
      $rootScope.readSettings();
      $scope.langState = 3;
    }, 300);
  });


  $scope.$watch('currency', (newVal, oldVal) => {
    if (newVal === oldVal) {
      return false;
    }
    $scope.currState = 2;

    eSteemService.getCurrencyRate(newVal).then((resp) => {
      console.log(resp.data)
      settingsService.set('currency', newVal);
      $rootScope.readSettings();
      $scope.currState = 3;
    });
  });


  $scope.$watch('nightMode', (newVal, oldVal) => {
    if (newVal === oldVal) {
      return false;
    }

    $scope.nightState = 2;
    $timeout(() => {
      if (newVal === true) {
        settingsService.set('theme', 'dark-theme');
      } else {
        settingsService.set('theme', 'light-theme');
      }
      $rootScope.readSettings();
      $scope.nightState = 3;
    }, 300);
  });

  $scope.save = () => {
    $scope.processing = true;
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
};
