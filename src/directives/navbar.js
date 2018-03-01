export default ($location, $uibModal) => {
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

      $scope.openSettings = () => {
        $uibModal.open({
          templateUrl: 'templates/settings.html',
          controller: 'settingsCtrl',
          windowClass: 'settings-modal',
          backdrop: 'static',
          keyboard: false
        }).result.then(function (data) {
          // Success
        }, function () {
          // Cancel
        });
      }
    }
  };
};
