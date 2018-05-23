export default ($scope, $rootScope, $uibModalInstance, eSteemService, activeUsername, afterClick) => {

  $scope.loadingImages = true;
  $scope.images = [];

  const fetchImages = () => {
    eSteemService.getImages(activeUsername()).then((resp) => {
      $scope.images = resp.data;

    }).catch((e) => {
      $rootScope.showError('Could not fetch images!');
    }).then(() => {
      $scope.loadingImages = false;
    });
  };

  fetchImages();

  $scope.clicked = (img) => {
    afterClick(img.url);
    $scope.close();
  };

  $scope.close = () => {
    $uibModalInstance.dismiss('cancel');
  };
}
