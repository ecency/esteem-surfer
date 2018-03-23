const prepareAuthorData = (authorData) => {

  let id = authorData.id;
  let username = authorData.name;
  let name = '';
  let bio = '';

  if (authorData.json_metadata !== undefined && authorData.json_metadata !== '') {
    try {
      let profile = JSON.parse(authorData.json_metadata).profile;
      name = profile.name;

      if (profile.about !== undefined) {
        bio = profile.about;
      }
    } catch (e) {
    }
  }

  return [id, username, name, bio];
};


export default () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      authorData: '='
    },
    template: `<a ng-click="clicked()" class="author-name-popover" popover-enable="id" uib-popover-template="'templates/directives/author-name-popover.html'" popover-placement="bottom" popover-trigger="'outsideClick'" tabindex="0">{{ username }}</a>`,
    controller: ($scope, $rootScope, $location, steemService, steemAuthenticatedService, activeUsername) => {
      $scope.$watch('authorData', (n, o) => {
        if (n) {
          [$scope.id, $scope.username, $scope.name, $scope.bio] = prepareAuthorData(n);
        }
      });

      $scope.goToAuthor = () => {
        let u = `/account/${$scope.username}`;
        $location.path(u);
      };

      $scope.visitorName = null;
      $scope.visitorData = null;

      $rootScope.$on('userLoggedOut', () => {
        $scope.visitorName = null;
        $scope.visitorData = null;
      });

      $scope.clicked = () => {
        if ($scope.id) {
          if ($scope.visitorData === null) {
            loadVisitor();
          }
        }
      };

      $scope.loginSuccess = () => {
        loadVisitor();
      };

      $scope.loginDialogOpened = () => {
        // Close popover when login dialog opened
        document.querySelector('body').click();
      };

      const isFollowing = async (follower, following) => {
        let f = false;

        let resp = await steemService.getFollowing(follower, following, 'blog', 1).then((resp) => {
          return resp;
        }).catch((e) => {
          // TODO: Handle error
        });

        if (resp && resp.length > 0) {
          if (resp[0].follower === follower && resp[0].following === following) {
            f = true;
          }
        }

        return f
      };

      const isMuted = async (follower, following) => {
        let f = false;

        const resp = await steemService.getFollowing(follower, following, 'ignore', 1).then((resp) => {
          return resp;
        }).catch((e) => {
          // TODO: Handle error
        });

        if (resp && resp.length > 0) {
          if (resp[0].follower === follower && resp[0].following === following) {
            f = true;
          }
        }

        return f;
      };

      const loadVisitor = async () => {
        $scope.loadingVisitor = true;
        $scope.visitorName = activeUsername();

        $scope.visitorData = {
          following: false,
          muted: false,
          canFollow: true,
          canUnfollow: false,
          canMute: false,
          canUnmute: false
        };

        $scope.$applyAsync();

        let visitorName = activeUsername();
        if (visitorName) {
          let visitorName = activeUsername();

          let following = await isFollowing(visitorName, $scope.username);
          let muted = await isMuted(visitorName, $scope.username);

          $scope.visitorData = {
            following: following,
            muted: muted,
            canFollow: !following,
            canUnfollow: following,
            canMute: !muted,
            canUnmute: muted
          };
        }

        $scope.loadingVisitor = false;
        $scope.$applyAsync();
      };

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
        steemAuthenticatedService.follow($scope.username).then((resp) => {
          afterFollow();
        }).catch((e) => {
          // TODO: handle error
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
        steemAuthenticatedService.unfollow($scope.username).then((resp) => {
          afterUnfollow();
        }).catch((e) => {
          // TODO: handle error
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
        steemAuthenticatedService.mute($scope.username).then((resp) => {
          afterMute();
        }).catch((e) => {
          // TODO: handle error
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
        steemAuthenticatedService.unfollow($scope.username).then((resp) => {
          afterUnmute();
        }).catch((e) => {
          // TODO: handle error
        }).then(() => {
          $scope.vBlockControl = false;
          $scope.vUnmuting = false;
        });
      };
    }
  };
};

