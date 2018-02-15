export default ($scope, $uibModalInstance, post, steemService) => {
  $scope.loading = true;
  steemService.getActiveVotesAsync(post.author, post.permlink).then((resp) => {
    $scope.data = resp;
    $scope.dataLen = resp.length;
  }).catch(() => {
    // TODO: handle catch
  }).then(() => {
    $scope.loading = false;

  });

  $scope.authorClicked = (author) => {
    console.log(author);
  };

  $scope.close = () => {
    $uibModalInstance.dismiss('cancel');
  };
}
