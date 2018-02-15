export default ($scope, $routeParams, $filter, steemService, constants) => {

  // 1 get initial (cache) data
  // 2 set cache data when updated

  let category = $routeParams.category;
  let tag = $routeParams.tag;

  $scope.category = category;
  $scope.tag = tag;

  $scope.catTitle = constants.categories.find(i => i.name === category).key;
  if (tag) {
    $scope.tagTitle = $filter('capWord')(tag);
  }

  $scope.posts = [];
  let ids = [];
  let hasMore = true;

  const loadPosts = (startAuthor = null, startPermalink = null) => {
    // Convert category's fist letter to upper to use as function argument
    let by = $filter('capWord')(category);

    $scope.loadingPosts = true;
    steemService.getDiscussionsBy(by, (tag ? tag : null), startAuthor, startPermalink, constants.postListSize).then((resp) => {

      // if server returned less than 2 posts, it means end of pagination
      // comparison value is 2 because it returns at least 1 post on pagination
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

  loadPosts();

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
  }
};
