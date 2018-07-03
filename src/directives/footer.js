import {releasePost} from '../../package.json'

export default () => {
  return {
    restrict: 'AE',
    replace: true,
    scope: {},
    link: ($scope, $element) => {

    },
    templateUrl: 'templates/directives/footer.html',
    controller: ($scope, $rootScope, $location, appVersion) => {

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
      }
    }
  };
};
