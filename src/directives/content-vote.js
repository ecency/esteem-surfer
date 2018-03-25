export default () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      content: '='
    },
    template: `<a ng-click="clicked()" ng-mouseover="hoverIn()" ng-mouseleave="hoverOut()" ng-class="{'voted': isVoted, 'voting': voting}"><i class="fa fa-chevron-circle-up" ng-show="!voting"></i><i class="fa fa-spin fa-spinner fa-circle-o-notch" ng-show="voting"></i></a>`,
    controller: ($scope, $rootScope, $timeout, $uibModal, steemService, steemAuthenticatedService, activeUsername) => {
      $scope.voting = false;

      $scope.isVoted = false;
      $scope.lastVoteWeight = null;

      if (activeUsername()) {
        const u = activeUsername();
        for (let vote of $scope.content.active_votes) {
          if (vote.voter === u) {
            $scope.isVoted = true;
            $scope.lastVoteWeight = vote.percent;
            break;
          }
        }
      }

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
            },
            voteWeight: function () {
              return $scope.lastVoteWeight;
            }
          }
        });

        modalInstance.result.then(function () {
        }, function (res) {
          if (typeof res === 'number') {
            $scope.isVoted = res !== 0;
            $scope.lastVoteWeight = res !== 0 ? res : null;
            $rootScope.$broadcast('contentVoted', {id: $scope.content.id, weight: res, voter: activeUsername()});
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
          $scope.isVoted = true;
          $scope.lastVoteWeight = 10000;
          $rootScope.$broadcast('contentVoted', {id: $scope.content.id, weight: 10000, voter: activeUsername()});
        }).catch((e) => {
          $rootScope.showError(`Error${e.message ? ': ' + e.message : ''}`);
        }).then(() => {
          $scope.voting = false;
        })
      };

      const unvote = () => {
        $scope.voting = true;
        steemAuthenticatedService.vote($scope.content.author, $scope.content.permlink, 0).then((resp) => {
          $scope.isVoted = false;
          $scope.lastVoteWeight = null;
          $rootScope.$broadcast('contentVoted', {id: $scope.content.id, weight: 0, voter: activeUsername()});
        }).catch((e) => {
          $rootScope.showError(`Error${e.message ? ': ' + e.message : ''}`);
        }).then(() => {
          $scope.voting = false;
        })
      };
    }
  };
};
