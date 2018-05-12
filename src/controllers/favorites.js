export default ($scope, $rootScope, $location, $uibModalInstance, autoCancelTimeout, eSteemService, steemService, activeUsername) => {
  $scope.term = '';

  const loadData = function () {
    let _term = $scope.term.toLowerCase();
    if (_term === '') {
      $scope.favorites = $rootScope.favorites;
      return;
    }

    $scope.favorites = $rootScope.favorites.filter(i => i.searchTitle.indexOf(_term) > -1);
  };

  loadData();

  $scope.$watch('term', function (newVal, oldVal) {
    autoCancelTimeout(() => {
      loadData();
    }, 600);
  });

  $scope.accountClicked = (a) => {
    $uibModalInstance.dismiss('cancel');
    let u = `/account/${a.account}`;
    $location.path(u);
  };

  $scope.removeClicked = (b) => {
    $scope.processing = true;
    eSteemService.removeFavorite(activeUsername(), b._id).then((r) => {
      // Create favorites list ignoring deleted item
      $rootScope.favorites = $rootScope.favorites.filter(i => i._id !== b._id);
      loadData();
    }).catch((e) => {
      $rootScope.showError('Could not delete favorite.');
    }).then(() => {
      $scope.processing = false;
    });
  };
};
