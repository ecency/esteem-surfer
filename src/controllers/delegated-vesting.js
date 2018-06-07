export default ($scope, $rootScope, $filter, $uibModalInstance, $location, $confirm, steemService, steemAuthenticatedService, activeUsername, account) => {

  $scope.list = [];
  $scope.canUndelegate = activeUsername() === account;
  $scope.undelegating = false;

  const main = () => {
    $scope.list = [];
    $scope.loading = true;
    steemService.getVestingDelegations(account).then((resp) => {

      $scope.list = resp;
    }).catch((e) => {
      $rootScope.showError(e);
    }).then(() => {
      $scope.loading = false;
    });
  };

  main();

  $scope.unDelegate = (delegatee) => {
    $confirm($filter('translate')('ARE_YOU_SURE'), '', () => {
      $scope.undelegating = true;

      steemAuthenticatedService.unDelegateVestingShares(delegatee).then((resp) => {
        main();
      }).catch((e) => {
        $rootScope.showError(e);
      }).then(() => {
        $scope.undelegating = false;
      });
    })
  };

  $scope.authorClicked = (author) => {
    let u = `/account/${author}`;
    $location.path(u);
    $scope.close();
  };

  $scope.close = () => {
    $uibModalInstance.dismiss('cancel');
  };
}
