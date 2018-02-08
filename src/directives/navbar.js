export const navBarDirective = ($location) => {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      selectedCat: '=',
      selectedTag: '='
    },
    templateUrl: 'templates/directives/navbar.html',
    controller: ($scope, steemCategories) => {
      $scope.cats = steemCategories;

      $scope.linkClicked = (c) => {
        let u = `/posts/${c}`;
        if ($scope.selectedTag) {
          u += `/${$scope.selectedTag}`;
        }
        $location.path(u);
      };
    }
  };
};
