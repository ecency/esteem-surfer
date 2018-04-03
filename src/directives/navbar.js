export default ($rootScope, $location, $uibModal, userService, activeUsername) => {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      selectedSection: '=',
      selectedTag: '=',
      searchStr: '=?'
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

      $scope.tokenExchangeClicked = () => {
        $location.path('/token-exchange');
      };

      $scope.discoverClicked = () => {
        $location.path('/discover');
      };

      $scope.marketPlaceClicked = () => {
        $location.path('/market-place');
      };

      $scope.feedClicked = () => {
        $location.path(`/feed/${activeUsername()}`);
      };

      $scope.editorClicked = () => {
        $location.path(`/editor`);
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
            },
            onOpen: function () {
              return () => {

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
        $location.path(`/account/${activeUsername()}`);
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
      };

      $scope.searchButtonClicked = () => {
        const obj = {"str": $scope.searchStr};
        $location.path(`/search/${JSON.stringify(obj)}`);
      }
    }
  };
};
