import steem from 'steem';


export default ($scope, $rootScope, $timeout, $uibModalInstance, settingsService, eSteemService, steemApi, constants) => {

  // Form selection datas
  $scope.languages = constants.languages;
  $scope.currencies = constants.currencies;
  $scope.servers = constants.servers;

  const init = () => {
    // Initial values
    // Used $rootScope instead of settingsService.get() because $rootScope.readSettings() receives settings with
    // default values (it can also be done here but i don't want to pollute the code)
    // It may helps in future.

    $scope.language = $rootScope.language;
    $scope.currency = $rootScope.currency;
    $scope.server = $rootScope.server;
    $scope.nightMode = $rootScope.theme === 'dark-theme';
    $scope.customServerAddr = null;

    /*
    Form state codes:

    # Same for all settings
    1 = Initial (Nothing)
    2 = Processing
    3 = Successful

    # For server setting
    11 = Server Invalid
    12 = Server Failed
    13 = Server Timing Error

    */
    $scope.formState = 1;
  };

  init();

  $scope.serverControlVisible = false;

  $scope.$watch('language', (newVal, oldVal) => {
    if (newVal === oldVal || $scope.formState === 2) {
      return false;
    }
    $scope.formState = 2;
    $timeout(() => {
      settingsService.set('language', newVal);
      $rootScope.readSettings();
      $scope.formState = 3;
    }, 300);
  });


  $scope.$watch('currency', (newVal, oldVal) => {
    if (newVal === oldVal || $scope.formState === 2) {
      return false;
    }
    $scope.formState = 2;

    eSteemService.getCurrencyRate(newVal).then((resp) => {
      settingsService.set('currency', newVal);
      $rootScope.readSettings();
      $rootScope.currencyRate = resp.data;
      $scope.$broadcast('currencyChanged');
      $scope.formState = 3;
    }); // TODO: Handle catch
  });


  $scope.$watch('nightMode', (newVal, oldVal) => {
    if (newVal === oldVal || $scope.formState === 2) {
      return false;
    }

    $scope.formState = 2;
    $timeout(() => {
      if (newVal === true) {
        settingsService.set('theme', 'dark-theme');
      } else {
        settingsService.set('theme', 'light-theme');
      }
      $rootScope.readSettings();
      $scope.formState = 3;
    }, 300);
  });


  $scope.toggleServerControl = () => {
    $scope.serverControlVisible = !$scope.serverControlVisible;
  };


  $scope.setServer = (serverAddr = undefined) => {
    $scope.formState = 2;

    if (serverAddr === undefined) {
      if (!/^((http|https):\/\/)/.test($scope.customServerAddr)) {
        // Server Invalid
        $scope.formState = 11;
        return false;
      }
      serverAddr = $scope.customServerAddr;
    }

    steemApi.setServer(serverAddr);

    steem.api.getDynamicGlobalProperties(function (err, resp) {

      if (err) {
        // Server Failed
        $scope.formState = 12;
      } else {
        let localTime = new Date(new Date().toISOString().split('.')[0]);
        let serverTime = new Date(resp.time);
        let isAlive = (localTime - serverTime) < 15000;

        if (!isAlive) {
          // Server Timing Error
          $scope.formState = 13;
        } else {

          // Everything is ok. Change server.
          settingsService.set('server', serverAddr);
          $rootScope.readSettings();
          $scope.server = serverAddr;
          $scope.formState = 3;

          $scope.toggleServerControl();
        }
      }

      $scope.$apply();
    });
  };


  $scope.defaults = () => {
    $scope.formState = 2;

    $timeout(() => {
      $rootScope.setDefaultSettings();
      $rootScope.readSettings();
      init();
    }, 300);
  };


  $scope.cancel = () => {
    if ($scope.formState === 2) {
      return;
    }
    $uibModalInstance.dismiss('cancel');
  };
};
