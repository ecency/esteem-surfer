export default ($scope, $rootScope, eSteemService, activeUsername) => {

  $scope.loadingDrafts = true;
  $scope.drafts = [];

  const fetchDrafts = () => {
    eSteemService.getDrafts(activeUsername()).then((resp) => {
      const d = [];
      for (let i of resp.data) {
        if (i) {
          d.push(i);
        }
      }
      $scope.drafts = d;
    }).catch((e) => {
      $rootScope.showError('Could not fetch drafts!');
    }).then(() => {
      $scope.loadingDrafts = false;
    });
  };

  fetchDrafts();

  $rootScope.$on('DRAFT_DELETED', () => {
    fetchDrafts();
  });
};
