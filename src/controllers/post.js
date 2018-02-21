export default ($scope, $rootScope, $routeParams, $filter, $uibModal, steemService, steemApi, helperService) => {

  let parent = $routeParams.parent;
  let author = $routeParams.author;
  let permlink = $routeParams.permlink;

  $scope.loadingPost = true;

  let routePath = `/${parent}/@${author}/${permlink}`;
  let contentPath = `${author}/${permlink}`;


  let pathData = {};

  const makeComments = (parent) => {
    let comments = [];
    for (let k of parent.replies) {
      let reply = pathData.content[k];
      let comment = {
        author: reply.author,
        author_reputation: reply.author_reputation,
        body: reply.body,
        pending_payout_value: reply.pending_payout_value,
        created: reply.created,
        replies: makeComments(reply)
      };
      comments.push(comment);
    }

    comments.sort(function (a, b) {
      let keyA = a.pending_payout_value,
        keyB = b.pending_payout_value;

      if (keyA > keyB) return -1;
      if (keyA < keyB) return 1;
      return 0;
    });

    return comments
  };


  $scope.comments = [];

  steemService.getState(routePath).then((stateData) => {

    pathData = stateData;

    let post = stateData.content[contentPath];

    $scope.comments = makeComments(post);

    $scope.post = post;

    $scope.postTotalInfo = $filter('postPaymentDetail')(post);

    const postMeta = JSON.parse(post.json_metadata);
    $scope.postTags = postMeta.tags;

    $scope.isPayoutDeclined = post.max_accepted_payout.split(' ')[0] === '0.000';

    // console.log(post)
    // console.log(stateData)

    // Mark post as read
    helperService.setPostRead(post.id);
  }).catch((e) => {
    console.log(e)
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
