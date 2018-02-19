export default () => {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      post: '='
    },
    link: ($scope, $element) => {

    },
    // Instead of templateUrl, this way angular can render faster
    template: `<div class="post-list-item" ng-init="postImage = (post | catchPostImage)">
      <div class="post-header">
        <div class="post-author-left">
          <div class="post-author-pic">
            <img ng-src="https://steemitimages.com/u/{{ post.author }}/avatar/small">
          </div>
        </div>
        <div class="post-author-right">
          <span class="post-author-name"><a ng-click="authorClicked()">{{ post.author }}</a></span>
          <span class="post-author-reputation">{{ post.author_reputation|authorReputation|number:0 }}</span>
        </div>
        <div class="post-info">
          <span class="post-info-cat">{{ 'IN' | translate }} <a ng-click="parentClicked()">{{ post.parent_permlink }}</a></span>
          <span class="post-info-date"><a ng-click="createdClicked()" title="{{ post.created|dateFormatted }}"> {{post.created|timeAgo}}</a></span>
        </div>
      </div>
      <div class="post-body" ng-class="{'with-image': postImage}">
        <div class="post-image" ng-if="postImage">
          <a ng-click="imageClicked()">
            <img ng-src="{{ postImage }}">
          </a>
        </div>
        <div class="post-body-content">
          <h2 class="post-body-content-title">
            <a ng-click="titleClicked()" ng-class="{'visited': isVisited}">{{ post.title }}</a>
          </h2>
          <div class="post-body-content-summary"><a ng-click="summaryClicked()" ng-class="{'visited': isVisited}" ng-bind-html="post.body | postSummary"></a></div>
          <div class="post-body-content-controls">
            <div class="control-vote">
              <div class="up-vote">
                <a ng-click="upVoteClicked(post)" >
                  <i class="fa fa-chevron-circle-up"></i>
                </a>
              </div>
              <div class="post-total">
                <a ng-click="totalClicked(post)" uib-popover-html="postTotalInfo" popover-placement="right" popover-trigger="'focus'" tabindex="0" ng-class="{'payout-declined': !isMaxAcceptedPayout}">
                  <span class="cur-prefix">{{ $root.currency | currencySymbol }}</span>  {{ post | sumPostTotal | number }}
                </a>
              </div>
            </div>
            <div class="control-voters">
              <a ng-click="votersClicked(post)">
                <i class="fa fa-users"></i> {{ post.net_votes }}
              </a>
            </div>
            <div class="control-comments">
              <a ng-click="commentsClicked(post)">
                <i class="fa fa-comments"></i> {{ post.children }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
    controller: ($scope, $rootScope, $location, $sce, $filter, $uibModal) => {

      $scope.isMaxAcceptedPayout = $scope.post.max_accepted_payout.split(' ')[0] !== '0.000';

      $scope.postTotalInfo = $filter('postPaymentDetail')($scope.post);

      $scope.votersClicked = (post) => {
        $uibModal.open({
          templateUrl: 'templates/post-voters.html',
          controller: 'postVotersCtrl',
          windowClass: 'postVotersModal',
          resolve: {
            post: function () {
              return post;
            }
          }
        }).result.then(function (data) {
          // Success
        }, function () {
          // Cancel
        });
      };

      $scope.isVisited = $rootScope.visitedPosts.indexOf($scope.post.id) >= 0;

      const goPost = () => {
        $rootScope.selectedPost = $scope.post;
        let u = `/post/${$scope.post.author}/${$scope.post.permlink}`;
        $location.path(u);
      };

      $scope.titleClicked = () => {
        goPost();
      };

      $scope.summaryClicked = () => {
        goPost();
      };

      $scope.imageClicked = () => {
        goPost();
      };

      $scope.createdClicked = () => {
        goPost();
      };

      $scope.commentsClicked = () => {
        goPost();
      }
    }
  };
};
