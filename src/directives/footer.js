export default () => {
  return {
    restrict: 'AE',
    replace: true,
    scope: {},
    link: ($scope, $element) => {

    },
    templateUrl: 'templates/directives/footer.html',
    controller: ($scope, appVersion) => {

      $scope.version = appVersion;

      $scope.fn = () => {

      };
    }
  };
};
