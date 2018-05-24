const prepareFollowerData = (data) => {
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


export default ($scope, $rootScope, $uibModalInstance, accountData, steemService) => {

  const username = accountData.name;
  const fetchSize = 80;

  $scope.username = username;
  $scope.followerCount = accountData.follower_count;

  const main = () => {
    $scope.followerList = [];
    $scope.fetching = true;
    $scope.hasMore = false;
    $scope.searching = false;
    $scope.searched = false;

    steemService.getFollowers(username, null, 'blog', fetchSize).then((resp) => {

      const accountNames = resp.map(e => e.follower);
      return steemService.getAccounts(accountNames).then((resp) => resp);
    }).catch((e) => {
      $rootScope.showError(e);
    }).then((accounts) => {
      if (accounts) {
        if (accounts.length >= fetchSize) {
          $scope.hasMore = true;
        }

        accounts.forEach(e => $scope.followerList.push(prepareFollowerData(e)));
      }
      $scope.fetching = false;
    });
  };

  main();

  $scope.search = () => {
    const searchUser = $scope.searchUser.trim();
    if (searchUser === '') {
      return;
    }

    if ($scope.searching) {
      return;
    }

    $scope.followerList = [];
    $scope.fetching = true;
    $scope.hasMore = false;
    $scope.searching = true;

    steemService.getFollowers(username, searchUser, 'blog', 1).then((resp) => {
      $scope.searched = true;

      if (resp[0].follower === searchUser) {
        return steemService.getAccounts([searchUser]).then((resp) => resp);
      }
    }).catch((e) => {
      $rootScope.showError(e);
    }).then((accounts) => {
      if (accounts) {
        accounts.forEach(e => $scope.followerList.push(prepareFollowerData(e)));
      }
      $scope.fetching = false;
      $scope.searching = false;
    });
  };

  $scope.cancelSearch = () => {
    $scope.searchUser = '';
    main();
  };

  $scope.loadMore = () => {
    $scope.fetching = true;
    let lastItem = [...$scope.followerList].pop();
    steemService.getFollowers(username, lastItem.name, 'blog', fetchSize).then((resp) => {

      const accountNames = resp.map(e => e.follower);
      return steemService.getAccounts(accountNames).then((resp) => resp);
    }).catch((e) => {
      $rootScope.showError(e);
    }).then((accounts) => {
      if (accounts) {
        if (accounts.length < fetchSize) {
          $scope.hasMore = false;
        }

        accounts.forEach(e => $scope.followerList.push(prepareFollowerData(e)));
      }
      $scope.fetching = false;
    });
  };

  $scope.close = () => {
    $uibModalInstance.dismiss('cancel');
  };
}
