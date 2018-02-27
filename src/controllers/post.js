export default ($scope, $rootScope, $routeParams, $filter, $uibModal, $location, $q, steemService, helperService, constants) => {

  let parent = $routeParams.parent;
  let author = $routeParams.author;
  let permlink = $routeParams.permlink;

  let routePath = `/${parent}/@${author}/${permlink}`;
  let contentPath = `${author}/${permlink}`;

  let pathData = {};

  let commentsData = [];

  const commentsPerPage = constants.commentListSize;

  $scope.commentsLength = 0; // Length of compiled comments array (Not total comments count)
  $scope.commentsHasPrev = false;
  $scope.commentsHasNext = false;
  $scope.commentsCurPage = 1;
  $scope.commentsTotalPages = 0;


  const compileComments = (parent, sortField = 'pending_payout_value') => {
    let comments = [];
    for (let k of parent.replies) {

      let reply = pathData.content[k];

      comments.push(
        Object.assign(
          {},
          reply,
          {comments: compileComments(reply)},
          {author_data: pathData.accounts[reply.author]}
        )
      )
    }

    comments.sort(function (a, b) {
      let keyA = a[sortField],
        keyB = b[sortField];

      if (keyA > keyB) return -1;
      if (keyA < keyB) return 1;
      return 0;
    });

    return comments
  };

  const loadState = () => {
    return steemService.getState(routePath).then(stateData => {
      pathData = stateData;

      let content = stateData.content[contentPath];
      $scope.post = content;

      $scope.author = pathData.accounts[author];
      commentsData = compileComments(content);

      $scope.commentsLength = commentsData.length;
      $scope.commentsTotalPages = Math.ceil(commentsData.length / commentsPerPage);
      $scope.sliceComments();
    })
  };

  const scrollToComments = () => {
    document.querySelector('#content-main').scrollTop = 100;
  };

  $scope.commentsGoNext = () => {
    $scope.commentsCurPage += 1;
    $scope.sliceComments();
    scrollToComments();
  };

  $scope.commentsGoPrev = () => {
    $scope.commentsCurPage -= 1;
    $scope.sliceComments();
    scrollToComments();
  };

  $scope.sliceComments = () => {
    let start = ( $scope.commentsCurPage - 1) * commentsPerPage;
    let end = start + commentsPerPage;

    $scope.comments = commentsData.slice(start, end);

    $scope.commentsHasPrev = $scope.commentsCurPage > 1;
    $scope.commentsHasNext = $scope.commentsCurPage < $scope.commentsTotalPages;
  };

  $scope.post = $rootScope.Data['post'] || null;

  let init = () => {
    let defer = $q.defer();

    if ($scope.post) {
      defer.resolve($scope.post);
    } else if ($rootScope.selectedPost.permlink === permlink && $rootScope.selectedPost.author === author) {
      // The last selected post from list === this post
      defer.resolve($rootScope.selectedPost);
    } else {
      // When refreshed in development environment
      steemService.getContent(author, permlink).then((resp) => {
        defer.resolve(resp);
      }).catch((e) => {
        defer.reject(e)
      })
    }
    return defer.promise;
  };

  $scope.loadingPost = true;
  $scope.loadingRest = true;

  init().then((content) => {
    $scope.post = content;

    // Defined separately because $scope.post will be changed after state loaded.
    $scope.title = content.title;
    $scope.body = content.body;

    // Sometimes tag list comes with duplicate items. Needs to singularize.
    $scope.tags = [...new Set(JSON.parse($scope.post.json_metadata).tags)];

    // Temporary author data while loading original in background
    $scope.author = {name: $scope.post.author};

    $scope.loadingPost = false;

    loadState().catch((e) => {
      // TODO: Handle catch
    }).then(() => {
      $scope.loadingRest = false;
    });

    // Mark post as read
    helperService.setPostRead(content.id);

    // Add to nav history
    $rootScope.setNavVar('post', content);
  });


  $scope.parentClicked = () => {
    let u = `/posts/${$rootScope.selectedFilter}/${$scope.post.parent_permlink}`;
    $location.path(u);
  };

  $scope.tagClicked = (tag) => {
    let u = `/posts/${$rootScope.selectedFilter}/${tag}`;
    $location.path(u);
  }
};
