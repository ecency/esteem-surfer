export default () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      content: '<'
    },
    template: `<a ng-click="votersClicked()" title="{{ voteCount }} {{ 'VOTES' | translate | lowercase }}"><i class="fa fa-users"></i> {{ voteCount }} </a>`,
    controller: ($scope, $rootScope, $uibModal) => {

      const main = () => {
        if ($scope.content.active_votes) {
          $scope.voteCount = $scope.content.active_votes.length;
        } else {
          // For search results
          $scope.voteCount = $scope.content.net_votes;
        }
      };

      main();

      $rootScope.$on('CONTENT_REFRESH', (r, d) => {
        if (d.content.id === $scope.content.id) {
          $scope.content = d.content;
          main();
        }
      });

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

