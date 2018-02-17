export default ($scope, $rootScope, $routeParams, $filter, steemService, steemApi) => {

  let category = $routeParams.category;
  let author = $routeParams.author;
  let permlink = $routeParams.permlink;

  $scope.loadingPost = true;

  steemService.getContent(author, permlink).then((resp) => {
    $scope.post = resp;

    // Better to filter here. Angular calls filter twice in view.
    $scope.postBody = $filter('postBody')(resp.body)

  }).catch(() => {
    // TODO: Handle catch
  }).then(() => {
    $scope.loadingPost = false;
  })


};
