export default ($location, $uibModal) => {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      selectedFilter: '=',
      selectedTag: '='
    },
    templateUrl: 'templates/directives/navbar.html',
    controller: ($scope, $rootScope, constants) => {
      $scope.filters = constants.filters;

      $scope.linkClicked = (c) => {
        $rootScope.selectedFilter = c;

        let u = `/posts/${c}`;
        if ($scope.selectedTag) {
          u += `/${$scope.selectedTag}`;
        }
        $location.path(u);
      };

      $scope.hideBack = true;

      $scope.goBack = () => {
        console.log(document.referrer);

        // history.back();
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
