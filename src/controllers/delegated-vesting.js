export default ($scope, $uibModalInstance, $location, steemService, account) => {

  $scope.list = [];

  const main = () => {
    $scope.loading = true;

    steemService.getVestingDelegations(account).then((resp) => {

      console.log(resp)
      $scope.list = resp;
    }).catch((e) => {

    }).then(() => {
      $scope.loading = false;
    });
  };

  main();

  $scope.authorClicked = (author) => {
    let u = `/account/${author}`;
    $location.path(u);
    $scope.close();
  };

  $scope.close = () => {
    $uibModalInstance.dismiss('cancel');
  };
}
