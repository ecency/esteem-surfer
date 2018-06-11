import moment from 'moment';

require('moment-timezone');

export default ($scope, $rootScope, $routeParams, $timeout, $q, $location, $window, $uibModal, $filter, steemService, eSteemService, steemAuthenticatedService, activeUsername, constants) => {
  let username = $routeParams.username;
  let section = $routeParams.section || 'blog';

  $scope.authorData = null;
  $scope.loadingAuthor = false;
  $scope.visitorData = null;
  $scope.loadingVisitor = false;
  $scope.isMyPage = username === activeUsername();

  $scope.dataList = $rootScope.Data['dataList'] || [];
  $scope.loadingContents = false;

  $scope.votesIn24 = 0;

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

  $scope.$watchCollection('selectedActivity', (n, o) => {
    if (n === o) {
      return;
    }

    $rootScope.setNavVar('selectedActivity', n);
  });

  const loadAccount = async (refresh = false) => {
    $scope.loadingAuthor = true;
    $scope.$applyAsync();

    let account = null;

    if (!refresh && $rootScope.lastAuthorData && $rootScope.lastAuthorData.name === username) {
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

    $scope.hasUnclaimedRewards = ($scope.authorData.reward_steem_balance.split(' ')[0] > 0) ||
      ($scope.authorData.reward_sbd_balance.split(' ')[0] > 0) ||
      ($scope.authorData.reward_vesting_steem.split(' ')[0] > 0);

    $scope.$applyAsync();

    eSteemService.getActiveVotes(username).then((resp) => {
      $scope.votesIn24 = resp.data.count;
    });
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
      canUnmute: false,
      favorited: false
    };

    if ($scope.isMyPage) {
      $scope.loadingVisitor = false;
      return;
    }

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
          canFollow: !following,
          canUnfollow: following,
          canMute: !muted,
          canUnmute: muted
        };
      }
      $scope.$applyAsync();
    }

    eSteemService.isFavorite(visitorName, username).then((resp) => {
      $scope.visitorData.favorited = resp.data;
    });

    $scope.loadingVisitor = false;
  };

  let contentIds = [];
  let hasMoreContent = true;

  const buildActivityList = (rawList) => {
    moment.locale($rootScope.language);

    const date2key = function (s) {
      return moment(s).calendar(null, {
        sameDay: '[Today]',
        nextDay: '[Tomorrow]',
        nextWeek: 'dddd',
        lastDay: '[Yesterday]',
        lastWeek: '[Last] dddd',
        sameElse: 'DD/MM/YYYY'
      });
    };
    const maxGroup = 20;

    const build = function (rawData) {
      const dateList = [];

      for (let i = 0; i < rawData.length; i++) {
        let k = date2key(rawData[i].timestamp);
        if (dateList.indexOf(k) === -1) {
          dateList.push(k);
        }
      }

      const data = [];
      for (let m = 0; m < dateList.length; m++) {
        const k = dateList[m];
        const records = [];

        for (let l = 0; l < rawData.length; l++) {
          if (date2key(rawData[l].timestamp) === k) {
            records.push(rawData[l]);
          }
        }

        data.push({'key': k, 'records': records});

        if (data.length >= maxGroup) {
          if (m < (dateList.length - 1)) {
            $scope.hasMore = true;
          }
          break;
        }
      }
      return data;
    };

    return build(rawList);
  };
  $scope.selectedActivity = $rootScope.Data['selectedActivity'] || {id: 'votes'};

  const loadContentsFirst = () => {
    $scope.loadingContents = true;
    $scope.$applyAsync();

    let prms = null;
    switch (section) {
      case 'blog':
        prms = steemService.getState(`/@${username}/`);
        break;
      case 'comments':
        prms = steemService.getState(`/@${username}/comments`);
        break;
      case 'replies':
        prms = steemService.getState(`/@${username}/recent-replies`);
        break;
      case 'feed':
        prms = steemService.getDiscussionsBy('Feed', username, null, null, constants.postListSize);
        break;
      case 'activities':
        switch ($scope.selectedActivity.id) {
          case 'votes':
            prms = eSteemService.getMyVotes(username);
            break;
          case 'replies':
            prms = eSteemService.getMyReplies(username);
            break;
          case 'mentions':
            prms = eSteemService.getMyMentions(username);
            break;
          case 'follows':
            prms = eSteemService.getMyFollows(username);
            break;
          case 'reblogs':
            prms = eSteemService.getMyReblogs(username);
            break;
          case 'leaderboard':
            prms = eSteemService.getLeaderboard();
            break;
        }
        break;
    }

    prms.then(resp => {
      if (section === 'activities') {
        $scope.dataList = $scope.selectedActivity.id === 'leaderboard' ? resp.data : buildActivityList(resp.data);
        return;
      }

      const contents = section === 'feed' ? resp : resp.content;
      for (let k in contents) {
        let i = contents[k];

        if (contentIds.indexOf(i.id) === -1) {
          $scope.dataList.push(i);
        }
        contentIds.push(i.id);
      }

      if (['blog', 'comments', 'replies'].indexOf(section) !== -1) {
        // Sort list items by id
        $scope.dataList.sort(function (a, b) {
          let keyA = a.id,
            keyB = b.id;

          if (keyA > keyB) return -1;
          if (keyA < keyB) return 1;
          return 0;
        });
      }
    }).catch((e) => {
      $rootScope.showError('Could not fetch activities!');
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
      case 'feed':
        prms = steemService.getDiscussionsBy('Feed', username, startAuthor, startPermalink, constants.postListSize);
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

    if (['blog', 'comments', 'replies', 'feed', 'activities'].indexOf(section) !== -1) {
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
    $scope.loadingContents = true;
    steemService.getState(`/@${username}/transfers`).then(resp => {
      if (resp.accounts[username]) {
        let transfers = resp.accounts[username].transfer_history.slice(Math.max(resp.accounts[username].transfer_history.length - 100, 0));
        $scope.dataList = transfers;
      }
    }).catch((e) => {
      // TODO: Handle catch
    }).then(() => {
      $scope.loadingContents = false;
    });
  };

  $scope.changeSection = (section) => {
    $location.path(`/account/${username}/${section}`);
  };

  $scope.reload = () => {
    if ($scope.loadingRest) {
      return false;
    }

    $scope.dataList = [];
    if (section === 'wallet') {
      loadAccount(true).then(() => {
        loadTransactions();
      });
    } else {
      contentIds = [];
      loadContentsFirst();
    }
  };

  $scope.reachedBottom = () => {
    if (['wallet', 'activities'].indexOf(section) !== -1) {
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

  const afterFollow = () => {
    $scope.visitorData.following = true;
    $scope.visitorData.muted = false;
    $scope.visitorData.canFollow = false;
    $scope.visitorData.canUnfollow = true;
    $scope.visitorData.canMute = true;
    $scope.visitorData.canUnmute = false;
  };

  $scope.follow = () => {
    $scope.vBlockControl = true;
    $scope.vFollowing = true;
    steemAuthenticatedService.follow(username).then((resp) => {
      afterFollow();
    }).catch((e) => {
      $rootScope.showError(e);
    }).then(() => {
      $scope.vBlockControl = false;
      $scope.vFollowing = false;
    })
  };

  const afterUnfollow = () => {
    $scope.visitorData.following = false;
    $scope.visitorData.muted = false;
    $scope.visitorData.canFollow = true;
    $scope.visitorData.canUnfollow = false;
    $scope.visitorData.canMute = true;
    $scope.visitorData.canUnmute = false;
  };

  $scope.unfollow = () => {
    $scope.vBlockControl = true;
    $scope.vUnfollowing = true;
    steemAuthenticatedService.unfollow(username).then((resp) => {
      afterUnfollow();
    }).catch((e) => {
      $rootScope.showError(e);
    }).then(() => {
      $scope.vBlockControl = false;
      $scope.vUnfollowing = false;
    });
  };

  const afterMute = () => {
    $scope.visitorData.following = false;
    $scope.visitorData.muted = true;
    $scope.visitorData.canFollow = true;
    $scope.visitorData.canUnfollow = false;
    $scope.visitorData.canMute = false;
    $scope.visitorData.canUnmute = true;
  };

  $scope.mute = () => {
    $scope.vBlockControl = true;
    $scope.vMuting = true;
    steemAuthenticatedService.mute(username).then((resp) => {
      afterMute();
    }).catch((e) => {
      $rootScope.showError(e);
    }).then(() => {
      $scope.vBlockControl = false;
      $scope.vMuting = false;
    })
  };

  const afterUnmute = () => {
    $scope.visitorData.following = false;
    $scope.visitorData.muted = false;
    $scope.visitorData.canFollow = true;
    $scope.visitorData.canUnfollow = false;
    $scope.visitorData.canMute = true;
    $scope.visitorData.canUnmute = false;
  };

  $scope.unMute = () => {
    $scope.vBlockControl = true;
    $scope.vUnmuting = true;
    steemAuthenticatedService.unfollow(username).then((resp) => {
      afterUnmute();
    }).catch((e) => {
      $rootScope.showError(e);
    }).then(() => {
      $scope.vBlockControl = false;
      $scope.vUnmuting = false;
    });
  };

  $scope.fav = () => {
    $scope.vFavoriting = true;
    eSteemService.addFavorite(activeUsername(), username).then((resp) => {
      $scope.visitorData.favorited = true;
      $rootScope.$broadcast('favoritesChanged');
    }).catch((e) => {
      $rootScope.showError('Could not added to favorites!');
    }).then(() => {
      $scope.vFavoriting = false;
    });
  };

  $scope.unFav = () => {
    $scope.vFavoriting = true;
    eSteemService.removeFavoriteUser(activeUsername(), username).then((resp) => {
      $scope.visitorData.favorited = false;
      $rootScope.$broadcast('favoritesChanged');
    }).catch((e) => {
      $rootScope.showError('Could not remove from favorites!');
    }).then(() => {
      $scope.vFavoriting = false;
    });
  };

  $scope.profileEditClicked = () => {
    $uibModal.open({
      templateUrl: `templates/profile-edit.html`,
      controller: 'profileEditCtrl',
      windowClass: 'profile-edit-modal',
      resolve: {
        accountData: () => {
          return $scope.authorData;
        },
        afterUpdate: () => {
          return () => {
            $timeout(() => {
              $window.location.reload();
            }, 1000);
          }
        }
      }
    }).result.then((data) => {
      // Success
    }, () => {
      // Cancel
    });
  };

  $rootScope.$on('userLoggedIn', () => {
    loadVisitor(true);
    $scope.isMyPage = username === activeUsername();
  });

  $rootScope.$on('userLoggedOut', () => {
    loadVisitor(true);
    $scope.isMyPage = false;
  });

  $scope.claimRewardsClicked = () => {
    $scope.claimingRewards = true;
    const steemBal = $scope.authorData.reward_steem_balance;
    const sbdBal = $scope.authorData.reward_sbd_balance;
    const vestingBal = $scope.authorData.reward_vesting_balance;

    steemAuthenticatedService.claimRewardBalance(steemBal, sbdBal, vestingBal).then(resp => {
      loadAccount(true).then(() => {
        loadContents();
      });
    }).catch((e) => {
      $rootScope.showError(e);
    }).then(() => {
      $scope.claimingRewards = false;
    });
  };

  $scope.goToPost = (account, permlink) => {
    steemService.getContent(account, permlink).then((resp) => {
      $rootScope.selectedPost = resp;
      let u = `/post/${resp.category}/${account}/${permlink}`;
      $location.path(u);
    }).catch((e) => {
      $rootScope.showError(e);
    });
  };

  $scope.goToAccount = (account) => {
    let u = `/account/${account}`;
    $location.path(u);
  };

  $scope.goToComment = (account, permlink) => {
    steemService.getContent(account, permlink).then((resp) => {
      $rootScope.selectedPost = null;
      let u = `/post${resp.url.split("#")[0].replace('@', '')}/${resp.id}`;
      $location.path(u);
    }).catch((e) => {
      $rootScope.showError(e);
    });
  };

  $scope.followersClicked = () => {
    $uibModal.open({
      templateUrl: `templates/followers.html`,
      controller: 'followersCtrl',
      windowClass: 'followers-modal',
      resolve: {
        accountData: () => {
          return $scope.authorData;
        }
      }
    }).result.then((data) => {
      // Success
    }, () => {
      // Cancel
    });
  };

  $scope.followingClicked = () => {
    $uibModal.open({
      templateUrl: `templates/following.html`,
      controller: 'followingCtrl',
      windowClass: 'following-modal',
      resolve: {
        accountData: () => {
          return $scope.authorData;
        }
      }
    }).result.then((data) => {
      // Success
    }, () => {
      // Cancel
    });
  };

  $scope.witnessesClicked = () => {
    $location.path('/witnesses');
  };

  $scope.delegatedVestingClicked = () => {
    $uibModal.open({
      templateUrl: `templates/delegated-vesting.html`,
      controller: 'delegatedVestingCtrl',
      windowClass: 'delegation-modal',
      resolve: {
        account: () => {
          return username;
        }
      }
    }).result.then((data) => {
      // Success
    }, () => {
      // Cancel
    });
  };
};
