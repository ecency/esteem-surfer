export default () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      content: '<'
    },
    template: `<a ng-click="votersClicked()" uib-tooltip-html="toolTip"><i class="fa fa-users"></i> {{ voteCount }} </a>`,
    controller: ($scope, $rootScope, $uibModal, $sce, $filter) => {

      const prepareTooltip = () => {

        if ($scope.content.active_votes.length === 0) {
          $scope.toolTip = $sce.trustAsHtml($filter('__')('No votes'));
          return;
        }

        const totalPayout =
          parseFloat($scope.content.pending_payout_value.split(' ')[0]) +
          parseFloat($scope.content.total_payout_value.split(' ')[0]) +
          parseFloat($scope.content.curator_payout_value.split(' ')[0]);

        const voteRshares = $scope.content.active_votes.reduce((a, b) => a + parseFloat(b.rshares), 0);
        const ratio = totalPayout / voteRshares;
        const rate = $rootScope.currencyRate;

        const votesData = [];

        for (let a of $scope.content.active_votes) {
          const rew = ((a.rshares * ratio) * rate);

          votesData.push(Object.assign({}, {
            reward: rew,
            reward_fixed: rew.toFixed(1)
          }, a, {perc: (a.percent / 100).toFixed(1)}));
        }

        votesData.sort((a, b) => {
          const keyA = a['reward'],
            keyB = b['reward'];

          if (keyA > keyB) return -1;
          if (keyA < keyB) return 1;
          return 0;
        });

        let toolTip = `<div class="post-voters-tooltip-list">`;
        let max = 10;
        let more = 0;
        let i = 0;
        for (let v of votesData) {
          toolTip += `<div class="voter-item"><span class="voter-username">${v.voter}</span><span class="vote-perc">${v.perc }</span> <span class="vote-reward">${v.reward_fixed }${ $filter('currencySymbol')($rootScope.currency) }</span></div>`;
          i += 1;
          if (i === max) {
            more = votesData.length - max;
            break;
          }
        }

        if (more) {
          toolTip += `<strong>${ $filter('__')('and') } ${more} ${ $filter('__')('more') }</strong><br>`;
        }

        toolTip += '</div>';
        $scope.toolTip = $sce.trustAsHtml(toolTip);
      };

      const main = () => {
        if ($scope.content.active_votes) {
          $scope.voteCount = $scope.content.active_votes.length;

          prepareTooltip();
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

