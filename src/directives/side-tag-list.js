export default () => {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      selectedFilter: '=',
      selectedTag: '='
    },
    templateUrl: 'templates/directives/side-tag-list.html',
    controller: ($scope, $rootScope, $timeout, $location, steemService) => {

      let timeoutPromise = null;

      $scope.toggleTagFilter = () => {
        $rootScope.sideTagFilter = !$rootScope.sideTagFilter;

        if ($rootScope.sideTagFilter) {
          $timeout(() => {
            document.getElementById('txt-filter-tag').focus();
          }, 100);
        } else {
          $rootScope.sideAfterTag = '';
        }
      };

      $scope.closeTagFilter = () => {
        $rootScope.sideAfterTag = '';
        $rootScope.sideTagFilter = false;
        loadTags();
      };

      $rootScope.$watch('sideAfterTag', function (newVal, oldVal) {
        if (newVal === oldVal) {
          return;
        }

        if ($scope.loadingTags) {
          return;
        }

        if (timeoutPromise !== null) {
          $timeout.cancel(timeoutPromise);
          timeoutPromise = null;
        }

        timeoutPromise = $timeout(function () {
          loadTags();
        }, 600);
      });

      const loadTags = () => {
        $scope.loadingTags = true;
        steemService.getTrendingTags($rootScope.sideAfterTag).then((resp) => {
          $rootScope.tags = resp.map(a => a.name).filter(a => a.length > 0);
        }).catch(() => {
        }).then(() => {
          $scope.loadingTags = false;
        });
      };

      // Keep tags in root scope
      if ($rootScope.tags === undefined) {
        loadTags();
      }

      $scope.tagClicked = (t) => {
        $location.path(`/posts/${$scope.selectedFilter}/${t}`);
      };
    }
  };
};
