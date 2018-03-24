export default ($scope, $rootScope, $timeout, $uibModalInstance, voteHistoryService, activeUsername, steemAuthenticatedService, content) => {
  $scope.voting = false;

  $scope.slider = {
    value: voteHistoryService.get(activeUsername(), content.id) || 100,
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
    const weight = sliderVal * 100;

    steemAuthenticatedService.vote(content.author, content.permlink, weight).then((resp) => {
      if (sliderVal === 0) {
        voteHistoryService.remove(activeUsername(), content.id);
      } else {
        voteHistoryService.set(activeUsername(), content.id, sliderVal);
      }
      $uibModalInstance.dismiss();
    }).catch((e) => {
      $rootScope.showError(`Error${e.message ? ': ' + e.message : ''}`);
    }).then(() => {
      $scope.voting = false;
    });
  }
};
