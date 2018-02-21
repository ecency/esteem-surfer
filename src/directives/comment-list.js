export default () => {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      comments: '='
    },
    link: ($scope, $element) => {

    },
    template: `
      <div class="comment-list" >
        <comment-list-item comment="comment" ng-repeat="comment in comments"></comment-list-item>
      </div>`,
    controller: ($scope, $rootScope) => {


    }
  };
};
