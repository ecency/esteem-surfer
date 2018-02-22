export default () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      authorData: '='
    },
    template: `<a ng-click="" uib-popover-template="'templates/directives/author-name-popover.html'" popover-placement="bottom" popover-trigger="'outsideClick'" tabindex="0">{{ authorData.name }}</a>`,
    controller: ($scope) => {

      $scope.name = '';
      $scope.username = $scope.authorData.name;
      $scope.bio = '';


      if ($scope.authorData.json_metadata !== undefined && $scope.authorData.json_metadata !== '') {
        try {
          let profile = JSON.parse($scope.authorData.json_metadata).profile;
          $scope.name = profile.name;

          if (profile.about !== undefined) {
            $scope.bio = profile.about;
          }
        } catch (e) {
        }
      }

      $scope.followClicked = () => {
        console.log($scope.username + ' clicked ');
      };

      $scope.goToAuthor = () => {

      };
    }
  };
};

