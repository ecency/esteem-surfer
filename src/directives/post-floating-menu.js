export default () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      linkedElSelector: '<',
      content: '<'
    },
    link: ($scope, $element) => {
      const el = $element[0];
      const mainEl = document.querySelector('#content-main');
      const checkEl = document.querySelector($scope.linkedElSelector);

      const detect = () => {
        const bounding = checkEl.getBoundingClientRect();
        const shouldHide = bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight);
        if (shouldHide) {
          el.style.display = 'none';
        } else {
          el.style.display = 'block';
        }
      };

      detect();

      angular.element(mainEl).bind("scroll", function (e) {
        detect();
      });
    },
    templateUrl: 'templates/directives/post-floating-menu.html',
    controller: ($scope, $timeout, $rootScope, steemAuthenticatedService, helperService, activeUsername) => {
      const author = $scope.content.author;
      const permlink = $scope.content.permlink;

      $scope.reblogged = helperService.isPostReblogged(activeUsername(), author, permlink);
      $scope.reblogging = false;
      $scope.canReblog = false;

      $scope.reblog = () => {
        $scope.reblogging = true;

        steemAuthenticatedService.reblog(author, permlink).then(() => {
          helperService.setPostReblogged(activeUsername(), author, permlink);
          $scope.reblogged = true;
        }).catch((e) => {
          $rootScope.showError(e)
        }).then(() => {
          $scope.reblogging = false;
        });
      }
    }
  };
};
