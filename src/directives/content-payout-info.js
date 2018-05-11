export default () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      content: '<'
    },
    template: `<a ng-click="" uib-popover-template="'templates/directives/content-payout-popover.html'" popover-placement="top" popover-trigger="'outsideClick'" tabindex="0" ng-class="{'payout-declined': isPayoutDeclined}">
               <span class="cur-prefix">{{ $root.currency | currencySymbol }}</span> {{ content | sumPostTotal | number }}
               </a>`,
    controller: ($scope, $rootScope) => {

      const main = () => {
        $scope.pendingPayout = (Number($scope.content.pending_payout_value.split(' ')[0]) * $rootScope.currencyRate);
        $scope.promotedPayout = (Number($scope.content.promoted.split(' ')[0]) * $rootScope.currencyRate);
        $scope.authorPayout = (Number($scope.content.total_payout_value.split(' ')[0]) * $rootScope.currencyRate);
        $scope.curationPayout = (Number($scope.content.curator_payout_value.split(' ')[0]) * $rootScope.currencyRate);
        $scope.payout = ($scope.content.last_payout === '1970-01-01T00:00:00' ? $scope.content.cashout_time : $scope.content.last_payout);

        $scope.isPayoutDeclined = $scope.content.max_accepted_payout.split(' ')[0] === '0.000';
      };

      main();

      $rootScope.$on('CONTENT_REFRESH', (r, d) => {
        if (d.content.id === $scope.content.id) {
          $scope.content = d.content;
          main();
        }
      });

      $rootScope.$on('currencyChanged', (r, d) => {
        main();
      });
    }
  };
};

