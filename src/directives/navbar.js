export const navBarDir = ($location, $uibModal) => {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      selectedCat: '=',
      selectedTag: '='
    },
    templateUrl: 'templates/directives/navbar.html',
    controller: ($scope, constants) => {
      $scope.cats = constants.categories;

      $scope.linkClicked = (c) => {
        let u = `/posts/${c}`;
        if ($scope.selectedTag) {
          u += `/${$scope.selectedTag}`;
        }
        $location.path(u);
      };


      $scope.openSettings = () => {
        $uibModal.open({
          templateUrl: 'templates/settings.html',
          controller: 'settingsCtrl',
          windowClass: 'settingsModal'
        });
      }
    }
  };
};
