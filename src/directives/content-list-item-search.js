import {proxifyImageSrc} from '../helpers/proxify-image-src';


export default () => {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      content: '<'
    },
    link: ($scope, $element) => {

    },
    template: `
      <div class="content-list-item-search with-image" ng-class="{'visited-content': isVisited}"> 
        <div class="content-header">
            <div class="content-info-bar">
                <div class="content-author-pic" author-bg-img-style author="{{ content.author }}"></div>
                <div class="content-info-right-side">
                    <span class="content-author"><a ng-click="goDetail()">{{ content.author }}</a></span>
                    <span class="content-parent" ng-if="content.category">{{ 'IN' | translate }} <a ng-click="parentClicked()">{{ content.category }}</a></span>
                    <span class="content-mark content-mark-read"><svg width="10" height="10" viewBox="0 0 1660 1660"><path d="M896 256q-130 0-248.5 51t-204 136.5-136.5 204-51 248.5 51 248.5 136.5 204 204 136.5 248.5 51 248.5-51 204-136.5 136.5-204 51-248.5-51-248.5-136.5-204-204-136.5-248.5-51zm768 640q0 209-103 385.5t-279.5 279.5-385.5 103-385.5-103-279.5-279.5-103-385.5 103-385.5 279.5-279.5 385.5-103 385.5 103 279.5 279.5 103 385.5z" /></svg></span>
                    <span class="content-mark content-mark-unread"><svg width="10" height="10" viewBox="0 0 1660 1660"><path d="M1152 896q0 106-75 181t-181 75-181-75-75-181 75-181 181-75 181 75 75 181zm-256-544q-148 0-273 73t-198 198-73 273 73 273 198 198 273 73 273-73 198-198 73-273-73-273-198-198-273-73zm768 544q0 209-103 385.5t-279.5 279.5-385.5 103-385.5-103-279.5-279.5-103-385.5 103-385.5 279.5-279.5 385.5-103 385.5 103 279.5 279.5 103 385.5z" /></svg></span>
                    <span class="content-date"><a ng-click="goDetail()" title="{{ content.created|dateFormatted }}"> {{content.created_at|timeAgo}}</a></span>
                </div>
            </div>
        </div>
        <div class="content-body">
            <a ng-click="goDetail()" class="content-image" ng-if="contentImage">
              <img ng-src="{{ contentImage }}" fallback-src="img/noimage.png">  
            </a>
            <a ng-click="goDetail()" class="content-image" ng-if="!contentImage">
              <img ng-src="img/noimage.png">
            </a>
            <h2 class="content-body-title"><a ng-click="goDetail()" ng-bind-html="title"></a></h2>
            <div class="content-body-summary">
                <a ng-click="goDetail()" ng-bind-html="body"></a>
            </div>
        </div>
        <div class="content-footer">
            <div class="content-voting">
                <a ng-click="goDetail()" class="content-total">
                    <span class="cur-prefix">$ </span> {{ content.payout | number : 2 }}
                </a>
            </div>
            <div class="content-voters">
                <a ng-click="goDetail()"><i class="fa fa-users"></i> {{ content.total_votes }} </a>
            </div>
            <div class="content-comment-count">
                <a ng-click="goDetail(content)">
                    <i class="fa fa-comments"></i> {{ content.children }}
                </a>
            </div>
            <div class="content-app" ng-show="content.app" ng-if="content.app">{{ content.app }}</div>
        </div>
    </div>
    `,
    controller: ($scope, $rootScope, $location, $filter, $sce, helperService, activePostFilter) => {

      $scope.isVisited = helperService.isPostRead($scope.content.author, $scope.content.permlink);

      $scope.contentImage = $scope.content.img_url ? proxifyImageSrc($scope.content.img_url) : null;

      $scope.title = $sce.trustAsHtml($scope.content.title_marked ? $scope.content.title_marked : $scope.content.title);
      $scope.body = $scope.content.body_marked ? $sce.trustAsHtml($scope.content.body_marked) : $filter('postSummary')($scope.content.body);

      $scope.goDetail = () => {
        $rootScope.selectedPost = null;
        let u = `/post/${$scope.content.category}/${$scope.content.author}/${$scope.content.permlink}`;
        $location.path(u);
      };

      $scope.parentClicked = () => {
        let u = `/posts/${activePostFilter()}/${$scope.content.category}`;
        $location.path(u);
      };
    }
  };
};
