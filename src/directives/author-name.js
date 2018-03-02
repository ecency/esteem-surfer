const prepareAuthorData = (authorData) => {

  let id = authorData.id;
  let username = authorData.name;
  let name = '';
  let bio = '';

  if (authorData.json_metadata !== undefined && authorData.json_metadata !== '') {
    try {
      let profile = JSON.parse(authorData.json_metadata).profile;
      name = profile.name;

      if (profile.about !== undefined) {
        bio = profile.about;
      }
    } catch (e) {
    }
  }

  return [id, username, name, bio];
};

export default () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      authorData: '='
    },
    template: `<a ng-click="" class="author-name-popover" popover-enable="id" uib-popover-template="'templates/directives/author-name-popover.html'" popover-placement="bottom" popover-trigger="'outsideClick'" tabindex="0">{{ username }}</a>`,
    controller: ($scope, $location) => {
      $scope.$watch('authorData', (n, o) => {
        if (n) {
          [$scope.id, $scope.username, $scope.name, $scope.bio] = prepareAuthorData(n);
        }
      });

      $scope.followClicked = () => {
        console.log($scope.username + ' clicked ');
      };

      $scope.goToAuthor = () => {
        let u = `/author/${$scope.username}`;
        $location.path(u);
      };
    }
  };
};

