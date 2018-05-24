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

  $scope.hasMore = false;

  $scope.followingList = [];

  $scope.fetching = true;
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
