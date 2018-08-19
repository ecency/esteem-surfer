export default ($scope, $rootScope, $location, $routeParams, steemService, eSteemService) => {

  const searchStr = JSON.parse(decodeURIComponent($routeParams.obj)).str;
  $scope.searchStr = searchStr;

  $scope.posts = $rootScope.Data['posts'] || [];
  $scope.hits = $rootScope.Data['hits'] || 0;

  $scope.sortBy = $rootScope.Data['sortBy'] || 'popularity';
  $scope.scrollId = $rootScope.Data['scrollId'] || null;

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


  $scope.$watchCollection('sortBy', (n, o) => {
    if (n === o) {
      return;
    }

    $rootScope.setNavVar('sortBy', n);
  });

  $scope.$watchCollection('scrollId', (n, o) => {
    if (n === o) {
      return;
    }

    $rootScope.setNavVar('scrollId', n);
  });

  $scope.sortChanged = (n) => {
    $scope.posts = [];
    $scope.scrollId = null;

    loadPosts();
  };

  const loadPosts = (cb = null) => {
    $scope.loadingPosts = true;
    eSteemService.search(searchStr, $scope.sortBy, $scope.scrollId).then((resp) => {
      $scope.scrollId = resp.data.scroll_id;

      $scope.hits = resp.data.hits;

      resp.data.results.forEach((i) => {
        $scope.posts.push(i);
      });
    }).catch((e) => {
      if (e.data) {
        $rootScope.showError(e.data.message);
      } else {
        $rootScope.showError('Server error');
      }
    }).then(() => {
      $scope.loadingPosts = false;

      if (cb) {
        cb();
      }
    });
  };

  $scope.accounts = [];

  const loadAccounts = () => {
    steemService.lookupAccounts(searchStr, 10).then((resp) => {
      $scope.accounts = resp;
    })
  };

  if ($scope.posts.length === 0) {
    // if initial data is empty then load posts
    loadPosts(() => {
      loadAccounts()
    });
  } else {
    loadAccounts();
  }

  $scope.reachedBottom = () => {
    if ($scope.loadingPosts || !$scope.scrollId) {
      return false;
    }

    loadPosts();
  };

  $scope.reload = () => {
    if ($scope.loadingPosts) {
      return false;
    }

    $scope.posts = [];
    $scope.scrollId = null;
    loadPosts();
  };

  $scope.accountClicked = (a) => {
    let u = `/account/${a}`;
    $location.path(u);
  }
};
