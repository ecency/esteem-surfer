import {releasePost} from '../../package.json'

const powerLevel = (l) => {
  if (l >= 90) {
    return 4;
  }

  if (l >= 80) {
    return 3;
  }

  if (l >= 70) {
    return 2;
  }

  return 1;
};

export default () => {
  return {
    restrict: 'AE',
    replace: true,
    scope: {},
    link: ($scope, $element) => {

    },
    templateUrl: 'templates/directives/footer.html',
    controller: ($scope, $rootScope, $interval, $timeout, $location, appVersion, activeUsername) => {

      $scope.version = appVersion;

      $scope.faqClicked = () => {
        $rootScope.selectedPost = null;
        let u = `/post/esteem/good-karma/esteem-faq-updated-e2baacf0a8475`;
        $location.path(u);
      };

      $scope.verClicked = () => {
        $rootScope.selectedPost = null;

        const [t, a, p] = releasePost.split('/');
        const u = `/post/${t}/${a.replace('@', '')}/${p}`;
        $location.path(u);
      };

      const resetPower = () => {
        $rootScope.lastVp = 0;
        $scope.vp = null;
        $scope.vpLevel = 0;
        $scope.vpFullIn = '';
        $scope.notifyVp = false;
      };

      resetPower();

      const votingPower = () => {
        if (activeUsername() && $rootScope.userProps) {
          $scope.vp = $rootScope.userProps.voting_power / 100;
          $scope.vpLevel = powerLevel($scope.vp);
          $scope.vpFullIn = Math.ceil((100 - $scope.vp) * 0.833333); // 100% / 120h = 0.833333h for %1

          if ($rootScope.lastVp && $rootScope.lastVp !== $scope.vp) {
            $scope.notifyVp = true;

            $timeout(() => {
              $scope.notifyVp = false;
            }, 2000);
          }

          $rootScope.lastVp = $scope.vp;
        } else {
          resetPower();
        }
      };

      $rootScope.$on('userLoggedOut', () => {
        resetPower();
      });

      $rootScope.$on('userPropsRefreshed', () => {
        votingPower();
      });

      votingPower();
    }
  };
};
