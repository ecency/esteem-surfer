import moment from 'moment';


export default () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      activity: '<'
    },
    template: `<div>
      <div class="group-title" ng-if="activity.gkf">{{ date2key(activity.gk) }}</div>
      <div class="activity-list-item" ng-click="clicked(draft)" ng-class="{'not-read': activity.read === 0}">
        
        <a ng-click="goProfile(activity.source)" class="source-profile-pic" author-bg-img-style author="{{ activity.source }}"></a> 
        
        <!-- Votes -->
        <div class="activity-content" ng-if="['vote', 'unvote'].includes(activity.type)">
          <div class="first-line">
            <a ng-click="goProfile(activity.source)" class="source-name">{{ activity.source }}</a>  
            <span ng-if="activity.type==='vote'" class="activity-action"><i class="fa fa-thumbs-o-up"></i></span>
            <span ng-if="activity.type==='unvote'" class="activity-action"><i class="fa fa-thumbs-o-down"></i></span>
            <small>{{ activity.weight / 100 }}%</small>
          </div>
          <div class="second-line">
            <a ng-click="goPost(activity.author, activity.permlink)" class="post-link">{{ activity.permlink }}</a>
          </div>
        </div>
        
        <!-- Replies -->
        <div class="activity-content" ng-if="activity.type==='reply'" >
          <div class="first-line">
            <a ng-click="goProfile(activity.source)" class="source-name">{{ activity.source }}</a>  
            <span class="activity-action"><i class="fa fa-comment-o"></i></span>
            <a ng-click="goPost(activity.author, activity.permlink)" class="post-link">{{ activity.parent_permlink }}</a> 
          </div>
          <div class="second-line"><div class="markdown-view mini-markdown">{{activity.body | postSummary}}</div></div>
        </div>
        
        <!-- Mentions -->
        <div class="activity-content" ng-if="activity.type==='mention'" >
          <div class="first-line">
            <a ng-click="goProfile(activity.source)" class="source-name">{{ activity.source }}</a>  
            <span class="activity-action label label-default">{{ 'mentioned' | __ }}</span>
          </div>
          <div class="second-line"><a ng-click="goPost(activity.author, activity.permlink)" class="post-link">{{ activity.permlink }}</a> </div>
        </div>
        
        <!-- Follows -->
        <div class="activity-content" ng-if="['follow', 'unfollow', 'ignore'].includes(activity.type)">
          <div class="first-line">
            <a ng-click="goProfile(activity.source)" class="source-name">{{ activity.source }}</a>  
          </div>
          <div class="second-line">
              <span ng-if="activity.type==='follow'" class="label label-success">following</span>
              <span ng-if="activity.type==='unfollow'" class="label label-warning">unfollowed </span>
              <span ng-if="activity.type==='ignore'" class="label label-danger">ignored</span>
          </div>
        </div>
        
        <!-- Reblogs -->
        <div class="activity-content" ng-if="activity.type==='reblog'" >
          <div class="first-line">
            <a ng-click="goProfile(activity.source)" class="source-name">{{ activity.source }}</a>  
            <span class="activity-action"><i class="fa fa-retweet"></i></span>
          </div>
          <div class="second-line"><a ng-click="goContent(activity.author, activity.permlink)" class="post-link">{{ activity.permlink }}</a></div>
        </div>
        
      </div>
    </div>`,
    controller: ($scope, $rootScope, $location, $filter, $window, eSteemService, activeUsername) => {

      moment.locale($rootScope.language);

      $scope.clicked = (draft) => {

      };

      $scope.date2key = function (s) {
        if (s.split('-').length !== 3) {
          return s
        }

        let d = moment.utc(s);
        return d.format('DD MMMM YYYY');
      };
    }
  };
};
