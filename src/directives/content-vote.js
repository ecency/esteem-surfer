export default () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      content: '='
    },
    // template: `<div><a ng-click="" login-required required-keys="'posting'" on-login-success="clicked" ng-mouseover="hoverIn()" ng-mouseleave="hoverOut()" ng-class="{'voted': isVoted, 'voting': voting}"><i class="fa fa-chevron-circle-up" ng-show="!voting"></i><i class="fa fa-spin fa-spinner fa-circle-o-notch" ng-show="voting"></i></a></div>`,
    template: `<div ng-mouseover="hoverIn()" ng-mouseleave="hoverOut()"><a ng-click="" login-required required-keys="'posting'" on-login-success="clicked" popover-class="content-vote-popover" uib-popover-template="'templates/directives/content-vote-popover.html'" popover-placement="right" popover-trigger="'none'"  popover-is-open="popoverIsOpen"  ng-class="{'voted': isVoted, 'voting': voting}"><i class="fa fa-chevron-circle-up" ng-show="!voting"></i><i class="fa fa-spin fa-spinner fa-circle-o-notch" ng-show="voting"></i></a></div>`,
    controller: ($scope, $rootScope, $timeout, $uibModal, steemService, steemAuthenticatedService, voteHistoryService, settingsService, activeUsername) => {


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

          /*
          const v = voteHistoryService.get(u, $scope.content.id);
          if (v) {
            $scope.isVoted = true;
            $scope.lastVoteWeight = v;
          }*/

        }
      };

      reset();
      detectVote();

      $scope.popoverIsOpen = false;

      $scope.saveVotePerc = () => {
        let newVal = $scope.slider.value;
        settingsService.set('votePerc', newVal);
        $scope.popoverIsOpen = false;
      };

      $scope.slider = {
        value: 100,
        options: {
          floor: 0.1,
          ceil: 100,
          step: 0.1,
          precision: 1,
          ticksArray: [0, 25, 50, 75, 100],
          translate: function (value, sliderId, label) {
            return value + '%';
          }
        }
      };

      let mouseEnterTimer = null;
      let mouseLeaveTimer = null;

      $scope.hoverIn = () => {
        if (!activeUsername() || $scope.voting || mouseEnterTimer !== null || $scope.popoverIsOpen) {
          return;
        }

        $timeout.cancel(mouseLeaveTimer);
        mouseLeaveTimer = null;

        mouseEnterTimer = $timeout(() => {
          mouseEnterTimer = null;
          $scope.popoverIsOpen = true;

          $scope.slider.value = settingsService.get('votePerc', 100);
        }, 2000);
      };

      $scope.hoverOut = () => {
        $timeout.cancel(mouseEnterTimer);
        mouseEnterTimer = null;

        mouseLeaveTimer = $timeout(() => {
          mouseLeaveTimer = null;
          $scope.popoverIsOpen = false;
        }, 1000);
      };

      /*
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
      */

      $scope.clicked = () => {
        $timeout.cancel(mouseEnterTimer);
        $timeout.cancel(mouseLeaveTimer);
        mouseEnterTimer = null;
        mouseLeaveTimer = null;

        if ($scope.isVoted) {
          unvote();
        } else {
          vote();
        }
      };

      const vote = () => {
        $scope.voting = true;
        let perc = settingsService.get('votePerc', 100);
        let weight = perc * 100;
        steemAuthenticatedService.vote($scope.content.author, $scope.content.permlink, weight).then((resp) => {
          $scope.isVoted = true;
          $scope.lastVoteWeight = 10000;
          // voteHistoryService.set(activeUsername(), $scope.content.id, 10000);
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
          // voteHistoryService.remove(activeUsername(), $scope.content.id);
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
