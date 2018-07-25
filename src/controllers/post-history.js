export default ($scope, $rootScope, $uibModalInstance, $timeout, eSteemService, content) => {

  $scope.list = [];
  $scope.title = '';
  $scope.body = '';


  eSteemService.commentHistory(content.author, content.permlink).then((resp) => {
    $scope.list = resp.data;

    $scope.select(1);
  }).catch((e) => {
    $rootScope.showError('Could not fetch version list');
  });

  $scope.select = (v) => {
    $scope.selected = v;

    $scope.title = $scope.list[v-1].title;
    $scope.body = $scope.list[v-1].body;
  }
};
