export default ($rootScope, $location, $uibModal, userService, activeUsername) => {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      selectedSection: '=',
      selectedTag: '='
    },
    templateUrl: 'templates/directives/navbar.html',
    controller: ($scope, $rootScope, $location, $filter, constants) => {
      $scope.filters = constants.filters;
      $scope.selectedFilterName = $scope.filters.find(i => i.name === $rootScope.selectedFilter).key;

      if ($scope.selectedSection === 'feed') {
        $scope.selectedFilterName = $filter('translate')('FEED');
      }

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
            loginMessage: () => {
              return null;
            },
            afterLogin: () => {
              return (username) => {
                if ($location.path().indexOf('/feed/') === -1) {
                  $location.path(`/feed/${username}`);
                }
              }
            }
          }
        }).result.then((data) => {
          // Success
        }, () => {
          // Cancel
        });
      };

      $scope.logout = () => {
        userService.setActive(null);
        $rootScope.$broadcast('userLoggedOut');
      };


      $scope.profileClicked = () => {
        $location.path(`/author/${activeUsername()}`);
      };

      $scope.bookmarksClicked = () => {
        $uibModal.open({
          templateUrl: 'templates/bookmarks.html',
          controller: 'bookmarksCtrl',
          windowClass: 'bookmarks-modal'
        }).result.then((data) => {
          // Success
        }, () => {
          // Cancel
        });
      }
    }
  };
};
