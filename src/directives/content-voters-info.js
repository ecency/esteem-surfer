export default () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      content: '='
    },
    template: `<a ng-click="votersClicked()" title="{{ content.net_votes }} {{ 'VOTES' | translate | lowercase }}"><i class="fa fa-users"></i> {{ content.net_votes }}</a>`,
    controller: ($scope, $uibModal) => {
      $scope.votersClicked = () => {
        $uibModal.open({
          templateUrl: 'templates/content-voters.html',
          controller: 'contentVotersCtrl',
          windowClass: 'content-voters-modal',
          resolve: {
            content: function () {
              return $scope.content;
            }
          }
        }).result.then(function (data) {
          // Success
        }, function () {
          // Cancel
        });
      };
    }
  };
};

