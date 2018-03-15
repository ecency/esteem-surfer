export default ($scope, $rootScope, userService, activeUsername) => {

  const loadData = () => {
    $scope.accounts = userService.getAll();
    $scope.activeUsername = activeUsername();
  };

  loadData();
};
