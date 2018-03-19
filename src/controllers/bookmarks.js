export default ($scope, $rootScope, $location, $uibModalInstance, $timeout, eSteemService, steemService, activeUsername) => {

  $scope.term = '';

  const loadData = function () {
    let _term = $scope.term.toLowerCase();
    if (_term === '') {
      $scope.bookmarks = $rootScope.bookmarks;
      return;
    }

    $scope.bookmarks = $rootScope.bookmarks.filter(i => i.searchTitle.indexOf(_term) > -1);
  };

  loadData();

  let timeoutPromise = null;

  $scope.$watch('term', function (newVal, oldVal) {
    if (timeoutPromise !== null) {
      $timeout.cancel(timeoutPromise);
      timeoutPromise = null;
    }
    timeoutPromise = $timeout(function () {
      loadData();
    }, 600);
  });

  $scope.bookmarkClicked = (b) => {
    $scope.processing = true;
    steemService.getContent(b.author, b.permlink).then((post) => {
      $rootScope.selectedPost = post;
      goDetail(post);
    }).catch((e) => {
      $rootScope.showError('Could not fetch content.');
    }).then(() => {
      $scope.processing = false;
    });
  };

  $scope.removeClicked = (b) => {
    $scope.processing = true;
    eSteemService.removeBookmark(b._id, activeUsername()).then((r) => {
      // Create bookmark list ignoring deleted bookmark
      $rootScope.bookmarks = $rootScope.bookmarks.filter(i => i._id !== b._id);
      loadData();
    }).catch((e) => {
      $rootScope.showError('Could not delete bookmark.');
    }).then(() => {
      $scope.processing = false;
    });
  };

  const goDetail = (post) => {
    $rootScope.selectedPost = post;
    let u = `/post/${post.category}/${post.author}/${post.permlink}`;
    $uibModalInstance.dismiss('cancel');
    $timeout(() => {
      $location.path(u);
    }, 200);
  };


};
