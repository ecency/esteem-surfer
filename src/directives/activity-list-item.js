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
        <div class="activity-control"><a class="mark-read" ng-click="markAsRead()" uib-tooltip="{{ 'Mark as read' }}" ng-if="activity.read===0"></a></div>
        
        <a ng-click="goAccount(activity.source)" class="source-profile-pic" author-bg-img-style author="{{ activity.source }}"></a> 
        
        <!-- Votes -->
        <div class="activity-content" ng-if="['vote', 'unvote'].includes(activity.type)">
          <div class="first-line">
            <a ng-click="goAccount(activity.source)" class="source-name">{{ activity.source }}</a>  
            <span ng-if="activity.type==='vote'" class="activity-action"><i class="fa fa-thumbs-o-up"></i></span>
            <span ng-if="activity.type==='unvote'" class="activity-action"><i class="fa fa-thumbs-o-down"></i></span>
            <small>{{ activity.weight / 100 }}%</small>
          </div>
          <div class="second-line">
            <a ng-click="goContent(activity.author, activity.permlink)" class="post-link">{{ activity.permlink }}</a>
          </div>
        </div>
        
        <!-- Replies -->
        <div class="activity-content" ng-if="activity.type==='reply'" >
          <div class="first-line">
            <a ng-click="goAccount(activity.source)" class="source-name">{{ activity.source }}</a>  
            <span class="activity-action"><i class="fa fa-comment-o"></i></span>
            <a ng-click="goContent(activity.parent_author, activity.parent_permlink)" class="post-link">{{ activity.parent_permlink }}</a> 
          </div>
          <div class="second-line">
            <div class="markdown-view mini-markdown reply-body" ng-click="goContent(activity.author, activity.permlink)" >{{activity.body | postSummary:100 }}</div>
          </div>
        </div>
        
        <!-- Mentions -->
        <div class="activity-content" ng-if="activity.type==='mention'" >
          <div class="first-line">
            <a ng-click="goAccount(activity.source)" class="source-name">{{ activity.source }}</a>  
            <span class="activity-action label label-default">{{ 'mentioned' | __ }}</span>
          </div>
          <div class="second-line"><a ng-click="goContent(activity.author, activity.permlink)" class="post-link">{{ activity.permlink }}</a> </div>
        </div>
        
        <!-- Follows -->
        <div class="activity-content" ng-if="['follow', 'unfollow', 'ignore'].includes(activity.type)">
          <div class="first-line">
            <a ng-click="goAccount(activity.source)" class="source-name">{{ activity.source }}</a>  
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
            <a ng-click="goAccount(activity.source)" class="source-name">{{ activity.source }}</a>  
            <span class="activity-action"><i class="fa fa-retweet"></i></span>
          </div>
          <div class="second-line"><a ng-click="goContent(activity.author, activity.permlink)" class="post-link">{{ activity.permlink }}</a></div>
        </div>
        
      </div>
    </div>`,
    controller: ($scope, $rootScope, $location, steemService, eSteemService, activeUsername) => {

      moment.locale($rootScope.language);

      $scope.goAccount = (account) => {
        let u = `/account/${account}`;
        $location.path(u);
      };

      $scope.goContent = (account, permlink) => {
        steemService.getContent(account, permlink).then(resp => {
          if (resp.id) {
            $rootScope.selectedPost = null;
            const u = `/post/${resp.category}/${resp.author}/${resp.permlink}`;
            $location.path(u);
          }
        });
      };

      $scope.markAsRead = () => {
        $scope.activity.read = 1;

        eSteemService.marActivityAsRead(activeUsername(), $scope.activity.id).then((resp) => {
          $rootScope.unreadActivities = resp.data.unread;
        }).catch((e) => {
          $scope.activity.read = 0;
          $rootScope.showError('Could not marked as read');
        })
      };

      $rootScope.$on('activitiesMarked', () => {
        $scope.activity.read = 1;
      });

      $scope.date2key = function (s) {
        // if not date return self
        if (s.split('-').length !== 3) {
          return s
        }

        let d = moment.utc(s);
        return d.format('DD MMMM YYYY');
      };
    }
  };
};
