export default ($scope, $rootScope, eSteemService, activeUsername) => {

  $scope.loadingImages = true;
  $scope.images = [];

  const fetchImages = () => {
    eSteemService.getImages(activeUsername()).then((resp) => {
      $scope.images = resp.data;
    }).catch((e) => {
      $rootScope.showError(e);
    }).then(() => {
      $scope.loadingImages = false;
    });
  };

  fetchImages();
};
