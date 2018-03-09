export default ($timeout) => {
  return {
    restrict: 'A',
    link: function ($scope, $element) {
      $timeout(function () {
        $element[0].focus()
      }, 500);
    }
  }
};

