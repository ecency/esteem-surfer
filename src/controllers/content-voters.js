export default ($scope, $rootScope, $uibModalInstance, $location, content, steemService) => {
  $scope.loading = true;

  steemService.getActiveVotesAsync(content.author, content.permlink).then((resp) => {
    $scope.data = resp;
    $scope.dataLen = resp.length;
  }).catch((e) => {
    $rootScope.showError(e);
  }).then(() => {
    $scope.loading = false;

  });

  $scope.authorClicked = (author) => {
    let u = `/account/${author}`;
    $location.path(u);
    $scope.close();
  };

  $scope.close = () => {
    $uibModalInstance.dismiss('cancel');
  };
}
