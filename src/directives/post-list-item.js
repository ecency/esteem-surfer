export default () => {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      post: '=',
      asAuthor: '='
    },
    link: ($scope, $element) => {

    },
    // Instead of templateUrl, this way angular can render faster
    template: `
      <div class="post-list-item with-image" ng-init="postImage = (post | catchPostImage)" ng-class="{'visited-post': isVisited}">
        <div class="post-header">
            <div class="post-resteemed" ng-if="reSteemed"><i class="fa fa-retweet"></i> {{ 'RESTEEMED' | __  }}</div>
            <div class="post-resteemed" ng-if="reSteemedBy"><i class="fa fa-retweet"></i> {{ 'RESTEEMED_BY' | __  }} {{ reSteemedBy }}</div>
            <div class="post-info-bar">
                <div class="post-author-pic" author-bg-img-style author="{{ post.author }}"></div>
                <div class="post-info-right-side">
                    <span class="post-author"><a ng-click="authorClicked()">{{ post.author }}</a></span>
                    <span class="post-author-reputation">{{ post.author_reputation|authorReputation|number:0 }}</span>
                    <span class="post-parent">{{ 'IN' | translate }} <a ng-click="parentClicked()">{{ post.category }}</a></span>
                    <span class="post-mark post-mark-unread"><svg width="10" height="10" viewBox="0 0 1660 1660"><path d="M896 256q-130 0-248.5 51t-204 136.5-136.5 204-51 248.5 51 248.5 136.5 204 204 136.5 248.5 51 248.5-51 204-136.5 136.5-204 51-248.5-51-248.5-136.5-204-204-136.5-248.5-51zm768 640q0 209-103 385.5t-279.5 279.5-385.5 103-385.5-103-279.5-279.5-103-385.5 103-385.5 279.5-279.5 385.5-103 385.5 103 279.5 279.5 103 385.5z" /></svg></span>
                    <span class="post-mark post-mark-read"><svg width="10" height="10" viewBox="0 0 1660 1660"><path d="M1152 896q0 106-75 181t-181 75-181-75-75-181 75-181 181-75 181 75 75 181zm-256-544q-148 0-273 73t-198 198-73 273 73 273 198 198 273 73 273-73 198-198 73-273-73-273-198-198-273-73zm768 544q0 209-103 385.5t-279.5 279.5-385.5 103-385.5-103-279.5-279.5-103-385.5 103-385.5 279.5-279.5 385.5-103 385.5 103 279.5 279.5 103 385.5z" /></svg></span>
                    <span class="post-date"><a ng-click="createdClicked()" title="{{ post.created|dateFormatted }}"> {{post.created|timeAgo}}</a></span>
                </div>
            </div>
        </div>
        <div class="post-body">
            <a ng-click="imageClicked()" class="post-image" ng-if="postImage">
              <img ng-src="{{ postImage }}" fallback-src="img/fallback.png">
            </a>
            <a ng-click="imageClicked()" class="post-image" ng-if="!postImage">
              <img ng-src="img/noimage.png">
            </a>
            <h2 class="post-body-title"><a ng-click="titleClicked()" >{{ post.title }}</a></h2>
            <div class="post-body-summary">
                <a ng-click="summaryClicked()" ng-bind-html="post.body | postSummary"></a> &nbsp;
            </div>
        </div>
        <div class="post-footer">
            <div class="post-voting">
                <div class="post-up-vote">
                    <content-vote content="post"></content-vote>
                </div>
                <div class="post-total">
                    <content-payout-info content="post"></content-payout-info>
                </div>
            </div>
            <div class="post-voters">
                <content-voters-info content="post"></content-voters-info>
            </div>
            <div class="post-comment-count">
                <a ng-click="commentsClicked(post)">
                    <i class="fa fa-comments"></i> {{ post.children }}
                </a>
            </div>
            <div class="post-reblog"><a ng-class="{'reblogged': reblogged}" ng-click="" title="{{ 'POST_MENU_REBLOG' | __ }}" login-required required-keys="'posting'" on-login-success="reblog()"><i class="fa fa-retweet"></i></a></div>
            <div class="post-app" ng-show="app" ng-if="app">{{ app }}</div>
        </div>
    </div>
    `,
    controller: ($scope, $rootScope, $location, $sce, $filter, $uibModal, storageService, helperService, activePostFilter, activeUsername, steemService, steemAuthenticatedService, $confirm) => {
      $scope.isVisited = helperService.isPostRead($scope.post.author, $scope.post.permlink);
      $scope.reSteemed = ($scope.asAuthor && $scope.post.author !== $scope.asAuthor);
      $scope.reSteemedBy = ($scope.post.reblogged_by && $scope.post.reblogged_by.length > 0 ? $scope.post.reblogged_by[0] : null);

      let jsonMeta = {};
      try {
        jsonMeta = JSON.parse($scope.post.json_metadata);
      } catch (e) {
      }

      $scope.app = $filter('appName')(jsonMeta.app);

      const goDetail = () => {
        $rootScope.selectedPost = $scope.post;
        let u = `/post/${$scope.post.category}/${$scope.post.author}/${$scope.post.permlink}`;
        $location.path(u);
      };

      $scope.titleClicked = () => {
        goDetail();
      };

      $scope.summaryClicked = () => {
        goDetail();
      };

      $scope.imageClicked = () => {
        goDetail();
      };

      $scope.createdClicked = () => {
        goDetail();
      };

      $scope.commentsClicked = () => {
        goDetail();
      };

      $scope.authorClicked = () => {
        let u = `/account/${$scope.post.author}`;
        $location.path(u);
      };

      $scope.parentClicked = () => {
        let u = `/posts/${activePostFilter()}/${$scope.post.category}`;
        $location.path(u);
      };

      const activeUser = activeUsername();
      const author = $scope.post.author;
      const permlink = $scope.post.permlink;

      $scope.reblogged = helperService.isPostReblogged(activeUser, author, permlink);
      $scope.canReblog = !(activeUser === author);

      if (!$scope.reblogged &&
        $scope.canReblog &&
        activeUser) {
        steemService.getDiscussionsBy('Blog', activeUser, null, null, 20).then((contents) => {
          for (let content of contents) {
            if (content.author === author && content.permlink === permlink) {
              helperService.setPostReblogged(activeUser, author, permlink);
              $scope.reblogged = true;
            }
          }
        });
      }

      $scope.reblog = () => {
        $confirm($filter('translate')('ARE_YOU_SURE'), null, () => {
          $scope.reblogged = true;
          steemAuthenticatedService.reblog(author, permlink).then(() => {
            helperService.setPostReblogged(activeUser, author, permlink);
          }).catch((e) => {
            $scope.reblogged = false;
            $rootScope.showError(e);
          }).then(() => {
            $rootScope.showSuccess($filter('__')('Post reblogged'))
          });
        });
      };
    }
  };
};
