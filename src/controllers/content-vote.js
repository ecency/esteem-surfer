export default ($scope, $rootScope, $uibModalInstance, activeUsername, steemAuthenticatedService, content, voteWeight) => {

  $scope.slider = {
    value: voteWeight ? (voteWeight / 100) : 100,
    options: {
      floor: 0,
      ceil: 100,
      step: 0.1,
      precision: 1,
      ticksArray: [0, 25, 50, 75, 100],
      translate: function (value, sliderId, label) {
        return value + '%';
      }
    }
  };

  $scope.vote = () => {
    $scope.voting = true;

    const sliderVal = $scope.slider.value;
    const weight = parseInt(sliderVal * 100);

    steemAuthenticatedService.vote(content.author, content.permlink, weight).then((resp) => {
      $uibModalInstance.dismiss(weight);
    }).catch((e) => {
      $rootScope.showError(`Error${e.message ? ': ' + e.message : ''}`);
    }).then(() => {
      $scope.voting = false;
    });
  }
};
