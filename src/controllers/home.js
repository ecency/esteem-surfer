export const homeCtrl = function ($scope, $window, discussionsService, tagsService, $steem) {
  $scope.foo = 'Hello';


  $scope.posts = [];

  discussionsService.getDiscussionsBy('Trending').then(function (resp) {

    resp.forEach((i) => {
      $scope.$apply(
        $scope.posts.push(i)
      )
    })
  });

};
