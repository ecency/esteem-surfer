export default ($scope, $rootScope, $location, eSteemService, activeUsername) => {

  $scope.loadingSchedules = true;
  $scope.schedules = [];

  const fetchSchedules = () => {
    eSteemService.getSchedules(activeUsername()).then((resp) => {
      $scope.schedules = resp.data;
    }).catch((e) => {
      $rootScope.showError('Could not fetch schedules!');
    }).then(() => {
      $scope.loadingSchedules = false;
    });
  };

  fetchSchedules();

  $rootScope.$on('SCHEDULE_DELETED', () => {
    fetchSchedules();
  });

  $rootScope.$on('SCHEDULE_MOVED', () => {
    fetchSchedules();
  });

  $rootScope.$on('userLoggedOut', () => {
    $location.path('/');
  });
};
