export default () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      content: '='
    },
    template: `<div><a ng-click="" login-required required-keys="'posting'" on-login-success="clicked" ng-mouseover="hoverIn()" ng-mouseleave="hoverOut()" ng-class="{'voted': isVoted, 'voting': voting}"><i class="fa fa-chevron-circle-up" ng-show="!voting"></i><i class="fa fa-spin fa-spinner fa-circle-o-notch" ng-show="voting"></i></a></div>`,
    controller: ($scope, $rootScope, $timeout, $uibModal, steemService, steemAuthenticatedService, voteHistoryService, activeUsername) => {

      const reset = () => {
        $scope.voting = false;
        $scope.isVoted = false;
        $scope.lastVoteWeight = null;
      };

      const detectVote = () => {
        if (activeUsername()) {
          const u = activeUsername();
          for (let vote of $scope.content.active_votes) {
            if (vote.voter === u) {
              $scope.isVoted = true;
              $scope.lastVoteWeight = vote.percent;
              break;
            }
          }

          const v = voteHistoryService.get(u, $scope.content.id);
          if (v) {
            $scope.isVoted = true;
            $scope.lastVoteWeight = v;
          }
        }
      };

      reset();
      detectVote();

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

            if (res > 0) {
              voteHistoryService.set(activeUsername(), $scope.content.id, res);
            } else {
              voteHistoryService.remove(activeUsername(), $scope.content.id);
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
          $scope.isVoted = true;
          $scope.lastVoteWeight = 10000;
          voteHistoryService.set(activeUsername(), $scope.content.id, 10000);
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
          voteHistoryService.remove(activeUsername(), $scope.content.id);
        }).catch((e) => {
          $rootScope.showError(`Error${e.message ? ': ' + e.message : ''}`);
        }).then(() => {
          $scope.voting = false;
        })
      };

      $rootScope.$on('userLoggedIn', () => {
        reset();
        detectVote();
      });

      $rootScope.$on('userLoggedOut', () => {
        reset();
      });
    }
  };
};
