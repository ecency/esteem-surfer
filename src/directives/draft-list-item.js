export default () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      draft: '<'
    },
    template: `
      <div class="draft-list-item" ng-click="clicked(draft)">
        <button class="btn btn-xs btn-danger btn-delete" uib-tooltip="{{ 'REMOVE' | translate }}" ng-click="deleteClicked(draft); $event.stopPropagation();">
          <i class="fa fa-times" ng-if="!deleting"></i><i class="fa fa-spin fa-spinner fa-circle-o-notch" ng-show="deleting"></i>
        </button>
        <div class="draft-body">
            <h2 class="draft-body-title">{{ draft.title }}</h2>
            <div class="draft-body-summary">
                <span ng-bind-html="draft.body | postSummary"></span>
            </div>
        </div>
        <div class="draft-footer">
             <span class="draft-tags"><i class="fa fa-tags"></i> {{ draft.tags }}</span>
             <span class="draft-date">{{draft.timestamp|timeAgo}}</span>
        </div>
    </div>
    `,
    controller: ($scope, $rootScope, $location, $filter, $window, eSteemService, activeUsername) => {

      $scope.deleting = false;
      $scope.draft.tags = $scope.draft.tags.replace(/ /g, ', ');

      $scope.clicked = (draft) => {
        $rootScope.editorDraft = {
          title: draft.title,
          body: draft.body,
          tags: draft.tags
        };

        $location.path(`/editor`);
      };

      $scope.deleteClicked = (draft) => {
        if ($window.confirm($filter('translate')('ARE_YOU_SURE'))) {
          $scope.deleting = true;
          eSteemService.removeDraft(draft._id, activeUsername()).then((resp) => {
            $rootScope.$broadcast('DRAFT_DELETED');
            $rootScope.showSuccess($filter('translate')('POST_IS_UNDRAFT'));
          }).catch((e) => {
            $rootScope.showError(e);
          }).then(() => {
            $scope.deleting = false;
          });
        }
      }
    }
  };
};
