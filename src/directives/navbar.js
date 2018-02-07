export const navBarDirective = function () {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      selectedItem: '@selectedItem'
    },
    link: function ($scope, $element) {

    },
    templateUrl: 'templates/directives/navbar.html',
    controller: function ($scope) {

      // console.log($scope.selectedItem)

      $scope.fn = function () {

      };
    }
  };
};
