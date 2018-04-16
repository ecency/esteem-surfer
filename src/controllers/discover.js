export default ($scope, $rootScope, $location, steemService) => {

  $scope.authors = $rootScope.Data['discoverAuthors'] || [];


  $scope.$watchCollection('authors', (n, o) => {
    if (n === o) {
      return;
    }

    $rootScope.setNavVar('discoverAuthors', n);
  });


  const loadAuthors = () => {

    const methods = ['Trending', 'Hot', 'Active', 'Votes', 'Children'];
    const method = methods[Math.floor(Math.random() * methods.length)];

    $scope.loadingAuthors = true;
    steemService.getDiscussionsBy(method, null, null, null, 100).then((resp) => {
      return resp;
    }).catch((e) => {
      $rootScope.showError(e);
    }).then((contents) => {

      contents.sort(function (a, b) {
        let keyA = parseInt(a.author_reputation),
          keyB = parseInt(b.author_reputation);

        if (keyA > keyB) return -1;
        if (keyA < keyB) return 1;
        return 0;
      });

      const authors = [];

      for (let content of contents) {
        if (authors.indexOf(content.author) === -1) {
          authors.push(content.author);
        }
      }

      $scope.authors = authors;

      $scope.loadingAuthors = false;
    });
  };

  if ($scope.authors.length === 0) {
    loadAuthors();
  }

  $scope.refresh = () => {
    $scope.authors = null;
    loadAuthors();
  };

  $scope.clicked = (author) => {
    let u = `/account/${author}`;
    $location.path(u);
  }
};
