


export default ($scope, $rootScope, $routeParams, $location, eSteemService, activeUsername) => {


  const account = $routeParams.account;

  if (account !== activeUsername()) {
    $location.path('/');
  }

  const activityType = $routeParams.type || '';

  $scope.account = account;
  $scope.activities = [];
  $scope.activityType = activityType;

  let ids = [];
  let hasMore = true;

  const loadActivities = (since = null) => {
    $scope.loading = true;

    let prms;

    switch (activityType) {
      case 'votes':
        prms = eSteemService.getMyVotes(account, since);
        break;
      case 'replies':
        prms = eSteemService.getMyReplies(account, since);
        break;
      case 'mentions':
        prms = eSteemService.getMyMentions(account, since);
        break;
      case 'follows':
        prms = eSteemService.getMyFollows(account, since);
        break;
      case 'reblogs':
        prms = eSteemService.getMyReblogs(account, since);
        break;
      default:
        prms = eSteemService.getActivities(account, since);
    }


    prms.then((resp) => {
      if (resp.data.length === 0) {
        hasMore = false;
        return false;
      }

      // because of operations can have same timestamp, we need to check id's if exists
      resp.data.forEach((i) => {
        if (ids.indexOf(i.id) === -1) {
          $scope.activities.push(i);
        }
        ids.push(i.id);
      });
    }).catch((e) => {
      $rootScope.showError('Could not fetch activities!');
    }).then(() => {
      $scope.loading = false;
    });
  };

  loadActivities();

  $scope.reachedBottom = () => {
    if ($scope.loading || !hasMore) {
      return false;
    }

    let lastActivity = [...$scope.activities].pop();
    loadActivities(lastActivity.id)
  };

  $scope.reload = () => {
    if ($scope.loading) {
      return false;
    }
    $scope.activities = [];
    ids = [];
    loadActivities();
  };

  $scope.typeChanged = () => {
    let u = `/${account}/activities`;

    if ($scope.activityType !== '') {
      u = `/${account}/activities/${$scope.activityType}`;
    }

    $location.path(u);
  };


}
