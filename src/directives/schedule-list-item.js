export default () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      schedule: '<'
    },
    template: `
      <div class="schedule-list-item with-image" ng-init="scheduleImage = (fakePost | catchPostImage)">
        <div class="item-header">
          <div class="item-info-bar">
            <div class="item-author-pic" author-bg-img-style author="{{ fakePost.author }}"></div>
              <div class="item-info-right-side">
                <span class="item-author"><a>{{ fakePost.author }}</a></span>
                <span class="item-author-reputation">{{ fakePost.author_reputation|authorReputation|number:0 }}</span>
                <span class="item-parent">{{ 'IN' | translate }} <a>{{ fakePost.category }}</a></span>
                <span class="item-date"><a><i class="fa fa-clock-o"></i> {{schedule.schedule|dateFormatted}}</a></span>
              </div>
          </div>
        </div>
        <div class="item-body">
            <a class="item-image" ng-if="scheduleImage">
              <img ng-src="{{ scheduleImage }}" fallback-src="img/fallback.png">
            </a>
            <a class="item-image" ng-if="!scheduleImage">
              <img ng-src="img/noimage.png">
            </a>
            <h2 class="item-body-title"><a>{{ schedule.title }}</a></h2>
            <div class="item-body-summary">
                <a ng-bind-html="schedule.body | postSummary"></a> &nbsp;
            </div>
        </div>
        <div class="item-footer">
          <div class="item-edit">
            <a ng-click="moveClicked(schedule)" title="{{ 'MOVE_TO_DRAFT' | translate }}">
              <i class="fa fa-pencil-square-o" ng-if="!moving"></i>
              <i class="fa fa-spin fa-spinner fa-circle-o-notch" ng-show="moving"></i>
            </a>
          </div>
          <div class="item-delete">
            <a ng-click="deleteClicked(schedule)" title="{{ 'REMOVE' | translate }}"><i class="fa fa-times"></i>
            </a>
          </div>
        </div>
      </div>
    `,
    controller: ($scope, $rootScope, $location, $filter, $window, eSteemService, activeUsername) => {

      $scope.deleting = false;

      const tags = $scope.schedule.tags ? $scope.schedule.tags.replace(/ /g, ', ') : '';

      $scope.fakePost = {
        json_metadata: '',
        body: $scope.schedule.body,
        author: activeUsername(),
        category: tags.split(',')[0],
        author_reputation: $rootScope.userProps ? $rootScope.userProps.reputation : 0
      };

      $scope.deleteClicked = (schedule) => {
        if ($window.confirm($filter('translate')('ARE_YOU_SURE'))) {
          $scope.deleting = true;
          eSteemService.removeSchedule(schedule._id, activeUsername()).then((resp) => {
            $rootScope.$broadcast('SCHEDULE_DELETED');
            $rootScope.showSuccess($filter('translate')('DELETED_SCHEDULE'));
          }).catch((e) => {
            $rootScope.showError('Could not deleted schedule record!');
          }).then(() => {
            $scope.deleting = false;
          });
        }
      };


      $scope.moving = false;
      $scope.moveClicked = (schedule) => {
        $scope.moving = true;
        eSteemService.moveSchedule(schedule._id, activeUsername()).then((resp) => {
          $rootScope.$broadcast('SCHEDULE_MOVED');
          $rootScope.showSuccess($filter('translate')('MOVED_SCHEDULE'));
        }).catch((e) => {
          $rootScope.showError('Could not moved schedule record!');
        }).then(() => {
          $scope.moving = false;
        });
      }
    }
  };
};
