export default () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {

    },
    template: `<button class="btn btn-sm btn-default btn-toggle-list-style" ng-class="{'active': $root.listStyle == 2}" title="{{ 'TOGGLE_LIST_STYLE' | __ }}" ng-click="toggle()"><i class="fa fa-th"></i></button>`,
    controller: ($scope, $rootScope, settingsService) => {
      $scope.toggle = () => {
        const curSetting = settingsService.get('list-style');
        const newSetting = curSetting === 2 ? 1 : 2;
        settingsService.set('list-style', newSetting);
        $rootScope.listStyle = newSetting;
      };
    }
  };
};
