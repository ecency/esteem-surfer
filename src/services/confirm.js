export default ($uibModal, $sce) => {
  return (title = '?', message = null, OkHandler = null, CancelHandler = null) => {
    return $uibModal.open({
      templateUrl: 'templates/confirm.html',
      controller: ($scope, $uibModalInstance, Title, Message, OkHandler, CancelHandler) => {
        $scope.title = Title;
        $scope.message = Message ? $sce.trustAsHtml(Message) : Message;

        $scope.ok = () => {
          $scope.close();
          if (OkHandler) {
            OkHandler();
          }
        };

        $scope.cancel = () => {
          $scope.close();
          if (CancelHandler) {
            CancelHandler();
          }
        };

        $scope.close = () => {
          $uibModalInstance.dismiss('cancel');
        };
      },
      windowClass: 'confirm-modal',
      resolve: {
        Title: () => {
          return title;
        },
        Message: () => {
          return message
        },
        OkHandler: () => {
          return OkHandler
        },
        CancelHandler: () => {
          return CancelHandler
        }
      }
    }).result.then((data) => {

    }, () => {

    });
  }
}
