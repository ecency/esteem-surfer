export default ($rootScope, $location, $uibModal, userService, activeUsername) => {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      selectedSection: '=',
      selectedTag: '='
    },
    templateUrl: 'templates/directives/navbar.html',
    controller: ($scope, $rootScope, constants) => {
      $scope.filters = constants.filters;
      $scope.selectedFilterName = $scope.filters.find(i => i.name === $rootScope.selectedFilter).key;

      $scope.filterClicked = (c) => {
        let u = `/posts/${c}`;
        if ($scope.selectedTag) {
          u += `/${$scope.selectedTag}`;
        }
        $location.path(u);
      };

      $scope.tokenMarketClicked = () => {
        $location.path('/token-market');
      };

      $scope.marketPlaceClicked = () => {
        $location.path('/market-place');
      };

      $scope.feedClicked = () => {
        $location.path(`/feed/${activeUsername()}`);
      };

      $scope.openSettings = () => {
        $uibModal.open({
          templateUrl: 'templates/settings.html',
          controller: 'settingsCtrl',
          windowClass: 'settings-modal',
          backdrop: 'static',
          keyboard: false
        }).result.then((data) => {
          // Success
        }, () => {
          // Cancel
        });
      };

      $scope.openLogin = () => {
        $uibModal.open({
          templateUrl: 'templates/login.html',
          controller: 'loginCtrl',
          windowClass: 'login-modal',
          resolve: {
            onLogin: function () {
              return onLogin
            }
          }
        }).result.then((data) => {
          // Success
        }, () => {
          // Cancel
        });
      };

      const onLogin = (r) => {
        switch (r.type) {
          case 's':
            userService.add(r.username, r.keys);
            userService.setActive(r.username);
            break;
          case 'sc':
            userService.addSc(r.username, r.accessToken, r.expiresIn);
            userService.setActive(r.username);
        }

        $rootScope.$broadcast('userLoggedIn');
        $location.path(`/feed/${activeUsername()}`);
      };

      $scope.logout = () => {
        // userService.remove($rootScope.user.username);
        userService.setActive(null);

        $rootScope.$broadcast('userLoggedOut');

        if ($location.path().indexOf('/feed/') !== -1) {
          $location.path(`/`);
        }
      };

      $scope.profileClicked = () => {
        $location.path(`/feed/${activeUsername()}`);
      };

      $scope.accountsClicked = () => {
        $location.path(`/accounts`);
      }
    }
  };
};
