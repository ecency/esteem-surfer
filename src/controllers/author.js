export default ($scope, $rootScope, $routeParams, $q, $location, $window, $filter, steemService, constants) => {
  let username = $routeParams.username;
  let section = $routeParams.section || 'blog';

  $scope.authorData = null;
  $scope.loadingAuthor = true;

  $scope.dataList = $rootScope.Data['dataList'] || [];

  $scope.$watchCollection('authorData', (n, o) => {
    // Persist author data
    if (n === o) {
      return;
    }

    $rootScope.lastAuthorData = n;
  });

  $scope.$watchCollection('dataList', (n, o) => {
    if (n === o) {
      return;
    }

    $rootScope.setNavVar('dataList', n);
  });

  const init = () => {
    let defer = $q.defer();

    if ($rootScope.lastAuthorData && $rootScope.lastAuthorData.name === username) {
      defer.resolve($rootScope.lastAuthorData);
    } else {
      steemService.getAccounts([username]).then(resp => {
        defer.resolve(resp[0]);
      }).catch((e) => {
        defer.reject(e)
      })
    }

    return defer.promise;
  };

  init().then(account => {

    $scope.authorData = account;

    if (account._merged_ === undefined) {
      $scope.authorData.profile = {};

      try {
        let profile = JSON.parse(account.json_metadata).profile;
        angular.extend($scope.authorData.profile, profile);
      } catch (e) {
      }

      steemService.getFollowCount(username).then(resp => {
        account.follower_count = resp.follower_count;
        account.following_count = resp.following_count;
        account._merged_ = true;

        $scope.authorData = account;
      });
    }

    $scope.loadingAuthor = false;

    if (['blog', 'comments', 'replies'].indexOf(section) !== -1) {
      if ($scope.dataList.length === 0) {
        // if initial data is empty then load contents
        loadContentsFirst();
      } else {
        // else count ids
        $scope.dataList.forEach((i) => {
          ids.push(i.id);
        })
      }
    }

    if (section === 'wallet') {
      // $scope.steemPower = (Number(account.vesting_shares.split(" ")[0]) / 1e6 * $rootScope.steemPerMVests).toFixed(3);
      // console.log( $scope.steemPower)
      // console.log(account)


      $scope.has_unclaimed_rewards = (account.reward_steem_balance.split(' ')[0] > 0) ||
        (account.reward_sbd_balance.split(' ')[0] > 0) ||
        (account.reward_vesting_steem.split(' ')[0] > 0);


      loadTransactions();
    }
  });

  let ids = [];
  let hasMore = true;

  const loadContentsFirst = () => {
    $scope.loadingRest = true;

    let statePath = null;
    switch (section) {
      case 'blog':
        statePath = '';
        break;
      case 'comments':
        statePath = 'comments';
        break;
      case 'replies':
        statePath = 'recent-replies';
        break;
    }

    steemService.getState(`/@${username}/${statePath}`).then(resp => {
      for (let k in resp.content) {
        let i = resp.content[k];

        if (ids.indexOf(i.id) === -1) {
          $scope.dataList.push(i);
        }
        ids.push(i.id);
      }

      // Sort list items by id
      $scope.dataList.sort(function (a, b) {
        let keyA = a.id,
          keyB = b.id;

        if (keyA > keyB) return -1;
        if (keyA < keyB) return 1;
        return 0;
      });

    }).catch((e) => {
      console.log(e)
      // TODO: Handle catch
    }).then(() => {

      $scope.loadingRest = false;
    });
  };

  const loadContents = (startAuthor = null, startPermalink = null) => {

    $scope.loadingRest = true;

    let prms = null;

    switch (section) {
      case 'blog':
        prms = steemService.getDiscussionsBy('Blog', username, startAuthor, startPermalink, constants.postListSize);
        break;
      case 'comments':
        prms = steemService.getDiscussionsBy('Comments', username, startAuthor, startPermalink, constants.postListSize);
        break;
      case 'replies':
        prms = steemService.getRepliesByLastUpdate(startAuthor, startPermalink, constants.postListSize);
        break;
    }

    prms.then((resp) => {
      // if server returned less than 2 posts, it means end of pagination
      // comparison value is 2 because steem api returns at least 1 post on pagination
      if (resp.length < 2) {
        hasMore = false;
        return false;
      }

      resp.forEach((i) => {
        if (ids.indexOf(i.id) === -1) {
          $scope.dataList.push(i);
        }
        ids.push(i.id);
      });

    }).catch((e) => {
      console.log(e)
      // TODO: Handle catch
    }).then(() => {

      $scope.loadingRest = false;
    });
  };

  const loadTransactions = () => {
    $scope.loadingRest = true;
    steemService.getState(`/@${username}/transfers`).then(resp => {
      if (resp.accounts[username]) {
        let transfers = resp.accounts[username].transfer_history.slice(Math.max(resp.accounts[username].transfer_history.length - 100, 0))
        $scope.dataList = transfers;
      }
    }).catch((e) => {
      console.log(e)
      // TODO: Handle catch
    }).then(() => {
      $scope.loadingRest = false;
    });
  };

  $scope.changeSection = (section) => {
    $location.path(`/author/${username}/${section}`);
  };

  $scope.reload = () => {
    if ($scope.loadingRest) {
      return false;
    }

    $scope.dataList = [];
    if (section === 'wallet') {
      loadTransactions();
    } else {
      ids = [];
      loadContentsFirst();
    }
  };

  $scope.reachedBottom = () => {
    if (section === 'wallet') {
      return false;
    }

    if ($scope.loadingRest || !hasMore) {
      return false;
    }

    let lastPost = [...$scope.dataList].pop();
    loadContents(lastPost.author, lastPost.permlink)
  };

  $scope.section = section;
  $scope.username = username;

  // Can be deleted in the future after locale files changed.
  $scope.translationData = {platformname: 'Steem', platformsunit: "$1.00", platformpower: "Steem Power"};
};
