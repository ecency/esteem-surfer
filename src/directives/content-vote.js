export default () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      content: '='
    },
    template: `<div ng-mouseover="hoverIn()" ng-mouseleave="hoverOut()"><a ng-click="" login-required required-keys="'posting'" on-login-success="loginSuccess" if-logged-in="clicked" popover-class="content-vote-popover" uib-popover-template="'templates/directives/content-vote-popover.html'" popover-placement="right" popover-trigger="'none'"  popover-is-open="popoverIsOpen"  ng-class="{'voted': voted, 'voting': voting, 'fetching': fetching}"><i class="fa fa-chevron-circle-up" ng-show="!voting"></i><i class="fa fa-spin fa-spinner fa-circle-o-notch" ng-show="voting"></i></a></div>`,
    controller: ($scope, $rootScope, $timeout, $filter, $uibModal, steemService, steemAuthenticatedService, helperService, activeUsername) => {

      $scope.fetching = false;
      $scope.votes = [];
      $scope.voted = false;
      $scope.voting = false;

      const fetchVotes = () => {
        const u = activeUsername();

        if (!u) {
          return;
        }

        $scope.fetching = true;
        steemService.getActiveVotesAsync($scope.content.author, $scope.content.permlink).then((resp) => {
          $scope.votes = resp;
        }).catch((e) => {
        }).then(() => {
          $scope.fetching = false;
        }).then(() => {
          for (let vote of $scope.votes) {
            if (vote.voter === u) {
              if (vote.percent > 0) {
                $scope.voted = true;
                break;
              }
            }
          }
        })
      };

      const estimate = (w) => {
        const vestToSp = (vests) => {
          return vests / 1e6 * $rootScope.steemPerMVests;
        };

        const spToVests = (sp) => {
          return sp * 1e6 / $rootScope.steemPerMVests;
        };

        const vestsToRshares = (sp, voting_power, vote_pct) => {
          const vestingShares = parseInt(spToVests(sp) * 1e6, 10);
          const power = (((voting_power * vote_pct) / 10000) / 50) + 1;
          return (power * vestingShares) / 10000;
        };

        if (!$rootScope.userProps) {
          return;
        }

        const p = $rootScope.userProps;

        const votingPower = p.voting_power;

        const totalVests = parseFloat(p.vesting_shares.split(" ")[0]) + parseFloat(p.received_vesting_shares.split(" ")[0]);

        const sp = vestToSp(totalVests);

        const votePct = w * 100;

        const rShares = vestsToRshares(sp, votingPower, votePct);

        return rShares / $rootScope.fundRecentClaims * $rootScope.fundRewardBalance * $rootScope.base;
      };

      const getVotePerc = () => {
        return helperService.getVotePerc(activeUsername());
      };

      const setVotePerc = (val) => {
        helperService.setVotePerc(activeUsername(), val);
      };

      fetchVotes();

      let canVote = false;
      let mouseEnterTimer = null;
      let mouseLeaveTimer = null;

      $scope.hoverIn = () => {
        if ($scope.popoverIsOpen || $scope.voting || mouseEnterTimer !== null || !activeUsername()) {
          return;
        }

        $timeout.cancel(mouseLeaveTimer);
        mouseLeaveTimer = null;

        mouseEnterTimer = $timeout(() => {
          mouseEnterTimer = null;

          openPopover();
        }, 2000);
      };

      $scope.hoverOut = () => {
        $timeout.cancel(mouseEnterTimer);
        mouseEnterTimer = null;

        mouseLeaveTimer = $timeout(() => {
          mouseLeaveTimer = null;
          closePopover();
        }, 1000);
      };

      $scope.saveVotePerc = () => {
        let newVal = $scope.weightSlider.value;
        setVotePerc(parseInt(newVal));
        closePopover();
        vote();
      };

      const openPopover = () => {
        $scope.popoverIsOpen = true;
        $scope.weightSlider = {
          value: getVotePerc(),
          options: {
            floor: 0.1,
            ceil: 100,
            step: 0.1,
            precision: 1,
            ticksArray: [0, 25, 50, 75, 100],
            translate: function (value, sliderId, label) {
              const estimated = estimate(value);
              switch (label) {
                case 'model':
                  if (estimated) {
                    return `<div class="text-center slider-tooltip">${ $filter('number')(estimated, 5)  } <b>$</b><br><small><i class="tooltip-perc">${ value }</i>%</small></div>`
                  } else {
                    return value + '%';
                  }
                default:
                  return value + '%';
              }
            }
          }
        };
      };

      const closePopover = () => {
        $scope.popoverIsOpen = false;
      };

      const vote = () => {
        $scope.voting = true;
        let perc = getVotePerc();
        let weight = perc * 100;
        console.log("voting with " + weight);
        steemAuthenticatedService.vote($scope.content.author, $scope.content.permlink, weight).then((resp) => {
          $scope.voted = true;
        }).catch((e) => {
          $rootScope.showError(`Error${e.message ? ': ' + e.message : ''}`);
        }).then(() => {
          $scope.voting = false;
        })
      };

      const unvote = () => {
        $scope.voting = true;
        steemAuthenticatedService.vote($scope.content.author, $scope.content.permlink, 0).then((resp) => {
          $scope.voted = false;
        }).catch((e) => {
          $rootScope.showError(`Error${e.message ? ': ' + e.message : ''}`);
        }).then(() => {
          $scope.voting = false;
        })
      };

      $scope.loginSuccess = () => {
        canVote = true;
      };

      $scope.clicked = () => {
        if (!canVote) {
          return;
        }

        // invalidate popover timers
        $timeout.cancel(mouseEnterTimer);
        $timeout.cancel(mouseLeaveTimer);
        mouseEnterTimer = null;
        mouseLeaveTimer = null;

        if ($scope.voted) {
          unvote();
        } else {
          vote();
        }
      };

      $rootScope.$on('userLoggedIn', () => {
        $timeout(() => {
          fetchVotes();
        }, 400);
      });

      $rootScope.$on('userLoggedOut', () => {
        $scope.voted = false;
      });

      /*
      $rootScope.$on('userLoggedIn', () => {
        $timeout(() => {
          $scope.voted = isVoted();
        }, 300);

      });

      $rootScope.$on('userLoggedOut', () => {
        $timeout(() => {
          $scope.voted = isVoted();
        }, 300);
      });
      */

      /*



      const reset = () => {
        $scope.voting = false;
        $scope.isVoted = false;
      };

      const detectVote = () => {
        if (activeUsername()) {
          const u = activeUsername();
          for (let vote of $scope.content.active_votes) {
            if (vote.voter === u) {
              $scope.isVoted = true;
              break;
            }
          }
        }
      };

      reset();
      detectVote();

      $scope.popoverIsOpen = false;

      $scope.saveVotePerc = () => {
        let newVal = $scope.weightSlider.value;
        settingsService.set('votePerc', parseInt(newVal));
        $scope.popoverIsOpen = false;
        vote();
      };

      $scope.weightSlider = {
        value: 100,
        options: {
          floor: 0.1,
          ceil: 100,
          step: 0.1,
          precision: 1,
          ticksArray: [0, 25, 50, 75, 100],
          translate: function (value, sliderId, label) {
            switch (label) {
              case 'model':
                return '<b>$</b> ' + $filter('number')(estimate(value));
              default:
                return value + '%';
            }
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

          $scope.weightSlider.value = settingsService.get('votePerc', 100);
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

      */
    }
  };
};
