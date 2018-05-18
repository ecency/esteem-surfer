const prepareAccountData = (data) => {
  let name = '';

  if (data.json_metadata !== undefined && data.json_metadata !== '') {
    try {
      let profile = JSON.parse(data.json_metadata).profile;
      name = profile.name;
    } catch (e) {
    }
  }

  return Object.assign({}, data, {full_name: name})
};


export default ($scope, $rootScope, $location, steemService) => {

  $scope.accountList = $rootScope.Data['discoverAccountList'] || [];

  $scope.$watchCollection('accountList', (n, o) => {
    if (n === o) {
      return;
    }

    $rootScope.setNavVar('discoverAccountList', n);
  });

  const loadAccounts = () => {

    const methods = ['Trending', 'Hot', 'Active', 'Votes', 'Children'];
    const method = methods[Math.floor(Math.random() * methods.length)];

    $scope.loadingAccounts = true;
    $scope.accountList = [];

    steemService.getDiscussionsBy(method, null, null, null, 100).then((contents) => {

      contents.sort(function (a, b) {
        let keyA = parseInt(a.author_reputation),
          keyB = parseInt(b.author_reputation);

        if (keyA > keyB) return -1;
        if (keyA < keyB) return 1;
        return 0;
      });

      const accounts = [];
      for (let content of contents) {
        if (accounts.indexOf(content.author) === -1) {
          accounts.push(content.author);
        }
      }

      return steemService.getAccounts(accounts).then((resp) => resp);
    }).catch((e) => {
      $rootScope.showError(e);
    }).then((accounts) => {
      if (accounts) {
        accounts.forEach(e => $scope.accountList.push(prepareAccountData(e)));
      }

      $scope.loadingAccounts = false;
    });
  };

  if ($scope.accountList.length === 0) {
    loadAccounts();
  }

  $scope.refresh = () => {
    loadAccounts();
  };
};
