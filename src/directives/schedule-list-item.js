export default () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      schedule: '<'
    },
    template: `
      <div class="schedule-list-item" ng-click="clicked(schedule)">
        <div class="item-buttons">
        <button class="btn btn-xs btn-danger btn-delete" uib-tooltip="{{ 'REMOVE' | translate }}" ng-click="deleteClicked(schedule)" >
          <i class="fa fa-times" ng-if="!deleting"></i><i class="fa fa-spin fa-spinner fa-circle-o-notch" ng-show="deleting"></i>
        </button>
        
        <button class="btn btn-xs btn-default btn-move" uib-tooltip="{{ 'MOVE_TO_DRAFT' | translate }}" ng-click="moveClicked(schedule)">
          <i class="fa fa-pencil-square-o" ng-if="!moving"></i><i class="fa fa-spin fa-spinner fa-circle-o-notch" ng-show="moving"></i>
        </button>
        </div>
        <div class="schedule-body">
            <h2 class="schedule-body-title">{{ schedule.title }}</h2>
            <div class="schedule-body-summary">
                <span ng-bind-html="schedule.body | postSummary"></span>
            </div>
        </div>
        <div class="schedule-footer">
             <span class="schedule-tags"><i class="fa fa-tags"></i> {{ schedule.tags }}</span>
             <span class="schedule-date"><i class="fa fa-clock-o"></i> {{schedule.schedule|dateFormatted }}</span>
        </div>
    </div>
    `,
    controller: ($scope, $rootScope, $location, $filter, $window, eSteemService, activeUsername) => {

      $scope.deleting = false;

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
