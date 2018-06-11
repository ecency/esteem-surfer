export default ($scope, $uibModalInstance, title, code, img) => {
  $scope.title = title;
  $scope.code = code;
  $scope.img = img;

  $scope.close = () => {
    $uibModalInstance.dismiss('cancel');
  };
}
