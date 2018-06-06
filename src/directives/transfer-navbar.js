export default () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {},
    templateUrl: 'templates/directives/transfer-navbar.html',
    controller: ($scope, $rootScope, $location, $uibModal, activeUsername) => {

      $scope.transferClicked = () => {
        $location.path(`/${ activeUsername() }/transfer`);
      };

      $scope.escrowClicked = () => {
        $location.path(`/${ activeUsername() }/escrow`);
      };

      $scope.escrowActionsClicked = () => {
        $location.path(`/${ activeUsername() }/escrow-actions`);
      };

      $scope.transferToSavingsClicked = () => {
        $location.path(`/${ activeUsername() }/transfer/to_savings`);
      };

      $scope.transferFromSavingsClicked = () => {
        $location.path(`/${ activeUsername() }/transfer/from_savings`);
      };

      $scope.powerUpClicked = () => {
        $location.path(`/${ activeUsername() }/power-up`);
      };

      $scope.powerDownClicked = () => {
        $location.path(`/${ activeUsername() }/power-down`);
      };

      $scope.delegateClicked = () => {
        $location.path(`/${ activeUsername() }/delegate`);
      };
    }
  }
}
