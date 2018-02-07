export const footerDirective = function () {
  return {
    restrict: 'AE',
    replace: true,
    scope: {},
    link: function ($scope, $element) {

    },
    templateUrl: 'templates/directives/footer.html',
    controller: function ($scope) {


      $scope.fn = function () {

      };
    }
  };
};
