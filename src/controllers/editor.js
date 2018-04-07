export default ($scope, $timeout) => {

  $scope.body = '';

  let bodyTimeout = null;

  $scope.$watch('body', (newVal, oldVal) => {

    setTimeout(() => {
      const e = document.querySelector('#editor-preview');
      e.scrollTop = e.scrollHeight;
    }, 200);
  });

  $scope.$watch('tempBody', (newVal, oldVal) => {
    if (newVal === oldVal) {
      return;
    }

    if (newVal === $scope.realBody) {
      return;
    }

    if (bodyTimeout !== null) {
      $timeout.cancel(bodyTimeout);
      bodyTimeout = null;
    }

    bodyTimeout = $timeout(() => {
      $scope.body = newVal;
    }, 500);
  })
};
