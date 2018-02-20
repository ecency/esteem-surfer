export default ($scope, $rootScope, $routeParams, $filter, steemService, $uibModal) => {

  let author = $routeParams.author;
  let permlink = $routeParams.permlink;

  $scope.loadingPost = true;

  steemService.getContent(author, permlink).then((post) => {
    $scope.post = post;

    $scope.postTotalInfo = $filter('postPaymentDetail')(post);

    const postMeta = JSON.parse(post.json_metadata);
    $scope.postTags = postMeta.tags;

    $scope.isPayoutDeclined = post.max_accepted_payout.split(' ')[0] === '0.000';
  }).catch(() => {
    // TODO: Handle catch
  }).then(() => {
    $scope.loadingPost = false;
  });


  $scope.votersClicked = (post) => {
    $uibModal.open({
      templateUrl: 'templates/post-voters.html',
      controller: 'postVotersCtrl',
      windowClass: 'postVotersModal',
      resolve: {
        post: function () {
          return post;
        }
      }
    }).result.then(function (data) {
      // Success
    }, function () {
      // Cancel
    });
  };


};
