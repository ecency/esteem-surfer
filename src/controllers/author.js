export default ($scope, $rootScope, $routeParams, $timeout, $q, $location, $window, $filter, steemService, steemAuthenticatedService, activeUsername, constants) => {
  let username = $routeParams.username;
  let section = $routeParams.section || 'blog';

  $scope.authorData = null;
  $scope.loadingAuthor = false;
  $scope.visitorData = null;
  $scope.loadingVisitor = false;

  $scope.dataList = $rootScope.Data['dataList'] || [];
  $scope.loadingContents = false;

  $scope.$watchCollection('authorData', (n, o) => {
    // Persist author data
    if (n === o) {
      return;
    }

    $rootScope.lastAuthorData = n;
  });

  $scope.$watchCollection('visitorData', (n, o) => {
    // Persist visitor data
    if (n === o) {
      return;
    }

    $rootScope.visitorData = n;
  });

  $scope.$watchCollection('dataList', (n, o) => {
    if (n === o) {
      return;
    }

    $rootScope.setNavVar('dataList', n);
  });

  const loadAccount = async () => {
    $scope.loadingAuthor = true;
    $scope.$applyAsync();

    let account = null;

    if ($rootScope.lastAuthorData && $rootScope.lastAuthorData.name === username) {
      account = $rootScope.lastAuthorData;
    } else {
      account = await steemService.getAccounts([username]).then(resp => {
        if (resp.length > 0) {
          return resp[0];
        }
        return undefined;
      }).catch((e) => {
        // TODO: Show error
        return null;
      })
    }

    if (account) {
      if (account._merged_ === undefined) {
        account.profile = {};

        try {
          let profile = JSON.parse(account.json_metadata).profile;
          angular.extend(account.profile, profile);
        } catch (e) {
        }

        let resp = await steemService.getFollowCount(username).then(resp => {
          return resp;
        }).catch((e) => {
          // TODO: Show error
          return null;
        });

        if (resp) {
          account.follower_count = resp.follower_count;
          account.following_count = resp.following_count;
          account._merged_ = true;
        }
      }
    }

    $scope.authorData = account;
    $scope.loadingAuthor = false;
    $scope.$applyAsync();
  };

  const loadVisitor = async (refresh = false) => {
    $scope.loadingVisitor = true;
    let visitorName = activeUsername();

    $scope.visitorData = {
      username: username,
      following: false,
      muted: false,
      canFollow: true,
      canUnfollow: false,
      canMute: false,
      canUnmute: false
    };

    $scope.$applyAsync();

    if (visitorName) {
      if (!refresh && $rootScope.visitorData && $rootScope.visitorData.username === username) {
        // Read from root scope. Helper for keep visitor data between sections.

        $scope.visitorData = $rootScope.visitorData;
      } else {
        $scope.visitorUsername = visitorName;

        $scope.$applyAsync();

        let following = false;
        let muted = false;

        // Is following
        let resp = await steemService.getFollowing(visitorName, username, 'blog', 1).then((resp) => {
          return resp;
        }).catch((e) => {
          // TODO: Handle error
        });

        if (resp && resp.length > 0) {
          if (resp[0].follower === visitorName && resp[0].following === username) {
            following = true;
          }
        }

        // Is muted
        resp = await steemService.getFollowing(visitorName, username, 'ignore', 1).then((resp) => {
          return resp;
        }).catch((e) => {
          // TODO: Handle error
        });

        if (resp && resp.length > 0) {
          if (resp[0].follower === visitorName && resp[0].following === username) {
            muted = true;
          }
        }

        $scope.visitorData = {
          username: username,
          following: following,
          muted: muted,
          canFollow: following === false,
          canUnfollow: following === true,
          canMute: following && muted === false,
          canUnmute: muted === true
        };
      }
    }

    $scope.loadingVisitor = false;
    $scope.$applyAsync();
  };

  let contentIds = [];
  let hasMoreContent = true;

  const loadContentsFirst = () => {
    $scope.loadingContents = true;
    $scope.$applyAsync();

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

        if (contentIds.indexOf(i.id) === -1) {
          $scope.dataList.push(i);
        }
        contentIds.push(i.id);
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
      // TODO: Handle catch
    }).then(() => {

      $scope.loadingContents = false;
    });
  };

  const loadContentsOnScroll = (startAuthor = null, startPermalink = null) => {

    $scope.loadingContents = true;

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
        hasMoreContent = false;
        return false;
      }

      resp.forEach((i) => {
        if (contentIds.indexOf(i.id) === -1) {
          $scope.dataList.push(i);
        }
        contentIds.push(i.id);
      });

    }).catch((e) => {

      // TODO: Handle catch
    }).then(() => {

      $scope.loadingContents = false;
    });
  };

  const loadContents = () => {

    if (['blog', 'comments', 'replies'].indexOf(section) !== -1) {
      if ($scope.dataList.length === 0) {
        // if initial data is empty then load contents
        loadContentsFirst();
      } else {
        // else count ids
        $scope.dataList.forEach((i) => {
          contentIds.push(i.id);
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

  };


  loadAccount().then(() => {
    // console.log("account data ok");
    loadVisitor().then(() => {
      // console.log("visitor data ok");
    });

    loadContents();
  });

  const loadTransactions = () => {
    $scope.loadingRest = true;
    steemService.getState(`/@${username}/transfers`).then(resp => {
      if (resp.accounts[username]) {
        let transfers = resp.accounts[username].transfer_history.slice(Math.max(resp.accounts[username].transfer_history.length - 100, 0));
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
      contentIds = [];
      loadContentsFirst();
    }
  };

  $scope.reachedBottom = () => {
    if (section === 'wallet') {
      return false;
    }

    if ($scope.loadingContents || !hasMoreContent) {
      return false;
    }

    let lastPost = [...$scope.dataList].pop();
    loadContentsOnScroll(lastPost.author, lastPost.permlink)
  };

  $scope.section = section;
  $scope.username = username;

  // Can be deleted in the future after locale files changed.
  $scope.translationData = {platformname: 'Steem', platformsunit: "$1.00", platformpower: "Steem Power"};


  $scope.follow = () => {
    $scope.followingProcess = true;
    steemAuthenticatedService.follow(username).then((resp) => {
      $timeout(() => {
        loadVisitor(true).then(() => {
          $scope.followingProcess = false;
        })
      }, 2000);
    }).catch((e) => {
      // TODO: handle error
      $scope.followingProcess = false;
    })
  };

  $rootScope.$on('userLoggedIn', () => {
    loadVisitor(true);
  });

  $rootScope.$on('userLoggedOut', () => {
    loadVisitor(true);
  });

  /*
  let visitorUsername = activeUsername();

  $scope.visitorUsername = activeUsername();
  $scope.loadingVisitor = true;
  $scope.isFollowing = false;
  $scope.isMuted = false;

  $scope.selfPage = "";
  $scope.canFollow = false;
  $scope.canUnfollow = false;
  $scope.canMute = false;
  $scope.canUnmute = false;


  const fetchVisitorRelations = async () => {

    let defer = $q.defer();

    let following = undefined;
    let muted = undefined;

    // Is following
    await steemService.getFollowing(activeUsername(), username, 'blog', 1).then((resp) => {
      following = false;
      if (resp.length > 0) {
        if (resp[0].follower === activeUsername() && resp[0].following === username) {
          following = true;
        }
      }
    }).catch((e) => {
      // TODO: Handle error
    });

    // Is muted
    await steemService.getFollowing(activeUsername(), username, 'ignore', 1).then((resp) => {
      muted = false;
      if (resp.length > 0) {
        if (resp[0].follower === activeUsername() && resp[0].following === username) {
          muted = true;
        }
      }
    }).catch((e) => {
      // TODO: Handle error
    });

    defer.resolve({following: following, muted: muted});

    return defer.promise;
  };

  const loadVisitor = () => {
    let visitorUsername = activeUsername();

    if (visitorUsername === username) {

      return;
    }

    if(!visitorUsername){


      return;
    }

    if (visitorUsername) {
      $scope.loadingVisitor = true;

      fetchVisitorRelations().then((r) => {
        if (r.following) {
          $scope.canFollow = false;
          $scope.canUnfollow = true;
        }

        if (r.muted) {
          $scope.canMute = false;
          $scope.canUnmute = true;
        }

        $scope.loadingVisitor = false;
      });
    } else {
      $scope.canFollow = true;
    }
  };

  loadVisitor();

  */

  /*
  $scope.canFollow = () => {
    if (!visitorUsername) {
      return true;
    }

    if (visitorUsername !== username) {
      return true;
    }
  };*/


  /*
  $scope.canUnfollow = () => {
    if (!visitorUsername) {
      return false;
    }
  };

  $scope.canMute = () => {
    if (!visitorUsername) {
      return false;
    }
  };

  $scope.canUnmute = () => {
    if (!visitorUsername) {
      return false;
    }
  };*/
};
