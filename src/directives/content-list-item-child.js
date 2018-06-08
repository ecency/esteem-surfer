export default () => {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      content: '='
    },
    link: ($scope, $element) => {

    },
    // Instead of templateUrl, this way angular can render faster
    template: `
      <div class="content-list-item-child" ng-init="contentImage = (content | catchPostImage)" ng-class="{'with-image': contentImage}">
        <div class="content-header">
            <div class="content-info-bar">
                <div class="content-author-pic" author-bg-img-style author="{{ content.author }}"></div>
                <div class="content-info-right-side">
                    <span class="content-author"><a ng-click="authorClicked()">{{ content.author }}</a></span>
                    <span class="content-author-reputation">{{ content.author_reputation|authorReputation|number:0 }}</span>
                    <span class="content-parent">{{ 'IN' | translate }} <a ng-click="parentClicked()">{{ content.category }}</a></span>
                    <span class="content-date"><a ng-click="createdClicked()" title="{{ content.created|dateFormatted }}"> {{content.created|timeAgo}}</a></span>
                </div>
            </div>
        </div>
        <div class="content-body">
            <a ng-click="imageClicked()" class="content-image" ng-if="contentImage">
              <img ng-src="{{ contentImage }}" fallback-src="img/noimage.png">  
            </a>
            <h2 class="content-body-title"><a ng-click="titleClicked()">RE: {{ content.root_title }}</a></h2>
            <div class="content-body-summary">
                <a ng-click="summaryClicked()" ng-bind-html="content.body | contentSummaryChild"></a>
            </div>
        </div>
        <div class="content-footer">
            <div class="content-voting">
                <div class="content-up-vote">
                  <content-vote content="content"></content-vote>
                </div>
                <div class="content-total">
                    <content-payout-info content="content"></content-payout-info>
                </div>
            </div>
            <div class="content-voters">
                <content-voters-info content="content"></content-voters-info>
            </div>
            <div class="content-comment-count">
                <a ng-click="commentsClicked(content)">
                    <i class="fa fa-comments"></i> {{ content.children }}
                </a>
            </div>
        </div>
    </div>
    `,
    controller: ($scope, $rootScope, $location, $sce, $filter, $uibModal, storageService, helperService, activePostFilter) => {

      const goDetail = () => {

        if($scope.content.parent_permlink.startsWith('re-')){
          // If comment of another comment then go comment dedicated page
          const tag = $scope.content.url.split('/')[1];
          $rootScope.selectedPost = null;
          let u = `/post/${tag}/${ $scope.content.author}/${ $scope.content.permlink}`;
          $location.path(u);
        } else {
          // if comment of post then go to post page
          let u = `/post${$scope.content.url.split("#")[0].replace('@', '')}/${$scope.content.id}`;
          $location.path(u);
        }
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
        let u = `/account/${$scope.content.author}`;
        $location.path(u);
      };

      $scope.parentClicked = () => {
        let u = `/posts/${activePostFilter()}/${$scope.content.category}`;
        $location.path(u);
      };
    }
  };
};
