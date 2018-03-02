export default ($scope, $routeParams, steemService, constants) => {
  let author = $routeParams.author;

  // let routePath = `/@${author}`;

  $scope.loadingAuthor = true;
  $scope.loadingRest = true;

  $scope.authorData = {
    username: author,
    follower_count: '...',
    following_count: '...'
  };

  $scope.dataList = [];

  const loadPosts = (startAuthor = null, startPermalink = null) => {
    $scope.loadingPosts = true;
    steemService.getDiscussionsBy('Blog', author, startAuthor, startPermalink, constants.postListSize).then((resp) => {
      $scope.dataList = resp;
    }).catch(() => {
      // TODO: Handle catch
    }).then(() => {
      $scope.loadingRest = false;
    });
  };

  steemService.getAccounts([author]).then(resp => {
    let account = resp[0];

    try {
      let profile = JSON.parse(account.json_metadata).profile;
      angular.extend($scope.authorData, profile);
    } catch (e) {
    }

    $scope.authorData.created = account.created;
    $scope.authorData.post_count = account.post_count;
    $scope.authorData.voting_power = account.voting_power;
    $scope.authorData.reputation = account.reputation

  }).then(() => {
    $scope.loadingAuthor = false;

    return steemService.getFollowCount(author).then(resp => {
      $scope.authorData.follower_count = resp.follower_count;
      $scope.authorData.following_count = resp.following_count;
    });
  }).then(() => {
    loadPosts();
  });

  $scope.author = author;
};
