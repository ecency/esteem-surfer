export default () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      itemSize: '<',
    },
    template: `
      <div>
        <div class="content-list-loading-item" ng-repeat="i in list">
          <div class="content-header"></div>  
          <div class="content-body">
            <div class="content-image"></div>
            <div class="content-body-title"></div>
            <div class="content-body-summary"></div>
          </div>
          <div class="content-footer">
            <div class="content-voting"></div>
            <div class="content-voters"></div>
            <div class="content-comment-count"></div>
            <div class="content-app"></div>
          </div>
        </div>
      </div>`,
    controller: ($scope) => {
      const list = [];
      for (let i = 1; i <= $scope.itemSize; i++) {
        list.push(i);
      }
      $scope.list = list;
    }
  }
}
