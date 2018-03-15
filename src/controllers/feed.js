export default ($scope, $rootScope, $routeParams, steemService, activeUsername, constants) => {

  let username = $routeParams.username;

  if (!$rootScope.user) {
    return false;
  }

  if (activeUsername() !== username) {
    return false;
  }

  $scope.posts = $rootScope.Data['feed'] || [];

  $scope.$watchCollection('posts', (n, o) => {
    if (n === o) {
      return;
    }

    $rootScope.setNavVar('feed', n);
  });

  let ids = [];
  let hasMore = true;

  const loadPosts = (startAuthor = null, startPermalink = null) => {

    $scope.loadingPosts = true;
    steemService.getDiscussionsBy('Feed', username, startAuthor, startPermalink, constants.postListSize).then((resp) => {

      // if server returned less than 2 posts, it means end of pagination
      // comparison value is 2 because steem api returns at least 1 post on pagination
      if (resp.length < 2) {
        hasMore = false;
        return false;
      }

      resp.forEach((i) => {
        if (ids.indexOf(i.id) === -1) {
          $scope.posts.push(i);
        }
        ids.push(i.id);
      });

    }).catch(() => {
      // TODO: Handle catch
    }).then(() => {
      $scope.loadingPosts = false;
    });
  };

  if ($scope.posts.length === 0) {
    // if initial data is empty then load posts
    loadPosts();
  } else {
    // else count ids
    $scope.posts.forEach((i) => {
      ids.push(i.id);
    })
  }

  $scope.reload = () => {
    if ($scope.loadingPosts) {
      return false;
    }
    $scope.posts = [];
    ids = [];
    loadPosts();
  };

  $scope.reachedBottom = () => {
    if ($scope.loadingPosts || !hasMore) {
      return false;
    }

    let lastPost = [...$scope.posts].pop();
    loadPosts(lastPost.author, lastPost.permlink)
  };
};
