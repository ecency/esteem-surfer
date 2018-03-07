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
              <img ng-src="{{ contentImage }}">  
            </a>
            <h2 class="content-body-title"><a ng-click="titleClicked()">RE: {{ content.root_title }}</a></h2>
            <div class="content-body-summary">
                <a ng-click="summaryClicked()" ng-bind-html="content.body | contentSummaryChild"></a>
            </div>
        </div>
        <div class="content-footer">
            <div class="content-voting">
                <div class="content-up-vote">
                    <a ng-click="upVoteClicked()">
                        <i class="fa fa-chevron-circle-up"></i>
                    </a>
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
    controller: ($scope, $rootScope, $location, $sce, $filter, $uibModal, storageService, helperService) => {

      const goDetail = () => {
        let u = `/post${$scope.content.url.split("#")[0].replace('@', '')}/${$scope.content.id}`;
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
        let u = `/author/${$scope.content.author}`;
        $location.path(u);
      };

      $scope.parentClicked = () => {
        let u = `/posts/${$rootScope.selectedFilter}/${$scope.content.category}`;
        $location.path(u);
      };
    }
  };
};
