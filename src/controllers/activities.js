export default ($scope, $rootScope, $routeParams, $location, eSteemService, activeUsername) => {

  const account = $routeParams.account;
  const activityType = $routeParams.type || '';

  if (account !== activeUsername()) {
    $location.path('/');
  }

  $scope.account = account;
  $scope.activityType = activityType;
  $scope.activities = [];

  let ids = [];
  let hasMore = true;

  $scope.loading = false;

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
    hasMore = true;

    loadActivities();
  };

  $scope.typeChanged = (type) => {
    let u = `/${account}/activities`;

    if (type !== '') {
      u = `/${account}/activities/${type}`;
    }

    $location.path(u);
  };

  $scope.marking = false;

  $scope.markAllRead = () => {
    $scope.marking = true;
    eSteemService.marActivityAsRead(activeUsername()).then((resp) => {
      $rootScope.unreadActivities = resp.data.unread;

      $rootScope.$broadcast('activitiesMarked');
    }).catch((e) => {
      $rootScope.showError('Could not marked as read');
    }).then(() => {
      $scope.marking = false;
    });
  }
}
