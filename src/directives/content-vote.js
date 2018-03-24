export default () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      content: '=',
      isVoted: '='
    },
    template: `<a ng-click="clicked()" ng-mouseover="hoverIn()" ng-mouseleave="hoverOut()" ng-class="{'voted': isVoted, 'voting': voting}"><i class="fa fa-chevron-circle-up" ng-show="!voting"></i><i class="fa fa-spin fa-spinner fa-circle-o-notch" ng-show="voting"></i></a>`,
    controller: ($scope, $rootScope, $timeout, $uibModal, steemAuthenticatedService, voteHistoryService, activeUsername) => {
      $scope.voting = false;

      let timer = null;

      $scope.hoverIn = () => {
        if (!activeUsername() || $scope.voting || timer !== null) {
          return;
        }

        timer = $timeout(() => {
          timer = null;
          openVoteModal();
        }, 2000);
      };

      $scope.hoverOut = () => {
        $timeout.cancel(timer);
        timer = null;
      };

      const openVoteModal = () => {
        const modalInstance = $uibModal.open({
          templateUrl: 'templates/content-vote.html',
          controller: 'contentVoteCtrl',
          windowClass: 'content-vote-modal',
          resolve: {
            content: function () {
              return $scope.content;
            }
          }
        });

        modalInstance.rendered.then(function () {
          $rootScope.$broadcast('rzSliderForceRender');
        });
      };

      $scope.clicked = () => {
        $timeout.cancel(timer);
        timer = null;

        if ($scope.isVoted) {
          unvote();
        } else {
          vote();
        }
      };

      const vote = () => {
        $scope.voting = true;
        steemAuthenticatedService.vote($scope.content.author, $scope.content.permlink, 10000).then((resp) => {
          voteHistoryService.set(activeUsername(), $scope.content.id, 100);
          $scope.isVoted = true;
        }).catch((e) => {
          $rootScope.showError(`Error${e.message ? ': ' + e.message : ''}`);
        }).then(() => {
          $scope.voting = false;
        })
      };

      const unvote = () => {
        $scope.voting = true;
        steemAuthenticatedService.vote($scope.content.author, $scope.content.permlink, 0).then((resp) => {
          voteHistoryService.remove(activeUsername(), $scope.content.id);
          $scope.isVoted = false;
        }).catch((e) => {
          $rootScope.showError(`Error${e.message ? ': ' + e.message : ''}`);
        }).then(() => {
          $scope.voting = false;
        })
      };
    }
  };
};
