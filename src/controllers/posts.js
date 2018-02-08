export const postsCtrl = function ($scope, $rootScope, $window, $routeParams, $timeout, $location, discussionsService, tagsService, steemCategories) {

  let category = $routeParams.category;
  let tag = $routeParams.tag;



  $scope.category = category;
  $scope.tag = tag;
  $scope.title = steemCategories.find(i => i.name === category).key;


  const loadTags = (finallyCb) => {
    tagsService.getTrendingTags().then(function (resp) {
      $rootScope.$apply(
        $rootScope.tags = resp.map(a => a.name).filter(a => a.length > 0)
      );
    }).catch(() => {
    }).then(() => {
      if (finallyCb) {
        finallyCb();
      }
    });
  };

  // Keep tags in root scope
  if ($rootScope.tags === undefined) {
    $scope.loadingTags = true;
    loadTags(function () {
      $scope.loadingTags = false;
    });
  }

  // Refresh tags in every 2 minutes
  $timeout(function () {
    loadTags();
  }, 120000);


  $scope.posts = [];

  const loadPosts = () => {
    // Convert category's fist letter to upper to use as function argument
    let by = category.substr(0, 1).toUpperCase() + category.substr(1);
    discussionsService.getDiscussionsBy(by, tag, 20).then(function (resp) {
      $scope.$apply(
        $scope.posts = $scope.posts.concat($scope.posts, ...resp)
      )
    });
  };

  loadPosts();


  $scope.tagClicked = (t) => {
    $location.path(`/posts/${category}/${t}`);
  }
};
