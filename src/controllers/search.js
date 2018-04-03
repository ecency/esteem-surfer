export default ($scope, $rootScope, $routeParams, eSteemService) => {

  const searchStr = JSON.parse($routeParams.obj).str;
  $scope.searchStr = searchStr;

  $scope.posts = $rootScope.Data['posts'] || [];
  $scope.hits = $rootScope.Data['hits'] || 0;

  $scope.$watchCollection('posts', (n, o) => {
    if (n === o) {
      return;
    }

    $rootScope.setNavVar('posts', n);
  });

  $scope.$watchCollection('hits', (n, o) => {
    if (n === o) {
      return;
    }

    $rootScope.setNavVar('hits', n);
  });

  let hasMore = true;
  let pageNum = 0;

  const loadPosts = () => {
    $scope.loadingPosts = true;
    eSteemService.search(searchStr, (pageNum + 1)).then((resp) => {

      console.log(resp.data)
      pageNum += 1;

      pageNum = resp.data.pages.current;
      hasMore = resp.data.pages.has_next;

      $scope.hits = resp.data.hits;

      resp.data.results.forEach((i) => {
        $scope.posts.push(i);
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
  }

  $scope.reachedBottom = () => {
    if ($scope.loadingPosts || !hasMore) {
      return false;
    }

    loadPosts();
  };

  $scope.reload = () => {
    if ($scope.loadingPosts) {
      return false;
    }

    $scope.posts = [];
    hasMore = false;
    pageNum = 0;
    loadPosts();
  };
};
