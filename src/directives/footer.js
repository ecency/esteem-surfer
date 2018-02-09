export const footerDir = () => {
  return {
    restrict: 'AE',
    replace: true,
    scope: {},
    link: ($scope, $element) => {

    },
    templateUrl: 'templates/directives/footer.html',
    controller: ($scope) => {

      $scope.fn = () => {

      };
    }
  };
};
