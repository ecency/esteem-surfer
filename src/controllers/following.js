const prepareFollowingData = (data) => {
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
  $scope.following = accountData.following_count;

  const main = () => {
    $scope.followingList = [];
    $scope.fetching = true;
    $scope.hasMore = false;
    $scope.searching = false;
    $scope.searched = false;

    steemService.getFollowing(username, null, 'blog', fetchSize).then((resp) => {

      const accountNames = resp.map(e => e.following);
      return steemService.getAccounts(accountNames).then((resp) => resp);
    }).catch((e) => {
      $rootScope.showError(e);
    }).then((accounts) => {
      if (accounts) {
        if (accounts.length >= fetchSize) {
          $scope.hasMore = true;
        }

        accounts.forEach(e => $scope.followingList.push(prepareFollowingData(e)));
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

    $scope.followingList = [];
    $scope.fetching = true;
    $scope.hasMore = false;
    $scope.searching = true;

    steemService.getFollowing(username, searchUser, 'blog', 1).then((resp) => {
      $scope.searched = true;

      if (resp[0].following === searchUser) {
        return steemService.getAccounts([searchUser]).then((resp) => resp);
      }
    }).catch((e) => {
      $rootScope.showError(e);
    }).then((accounts) => {
      if (accounts) {
        accounts.forEach(e => $scope.followingList.push(prepareFollowingData(e)));
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
    let lastItem = [...$scope.followingList].pop();
    steemService.getFollowing(username, lastItem.name, 'blog', fetchSize).then((resp) => {

      const accountNames = resp.map(e => e.following);
      return steemService.getAccounts(accountNames).then((resp) => resp);
    }).catch((e) => {
      $rootScope.showError(e);
    }).then((accounts) => {
      if (accounts) {
        if (accounts.length < fetchSize) {
          $scope.hasMore = false;
        }

        accounts.forEach(e => $scope.followingList.push(prepareFollowingData(e)));
      }
      $scope.fetching = false;
    });
  };

  $scope.close = () => {
    $uibModalInstance.dismiss('cancel');
  };
}
