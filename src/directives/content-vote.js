export default () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      foo: '='
    },
    template: `<a ng-click="upVoteClicked(post)"><i class="fa fa-chevron-circle-up"></i></a>`,
    controller: ($scope, $rootScope) => {

    }
  };
};
