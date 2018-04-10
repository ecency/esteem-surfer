export default ($scope, $rootScope, eSteemService, activeUsername) => {

  $scope.loadingDrafts = true;
  $scope.drafts = [];

  const fetchDrafts = () => {
    eSteemService.getDrafts(activeUsername()).then((resp) => {
      $scope.drafts = resp.data;
    }).catch((e) => {
      $rootScope.showError(e);
    }).then(() => {
      $scope.loadingDrafts = false;
    });
  };

  fetchDrafts();

  $rootScope.$on('DRAFT_DELETED', () => {
    fetchDrafts();
  });
};
