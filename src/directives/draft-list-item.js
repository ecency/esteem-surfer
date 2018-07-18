export default () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      draft: '<'
    },
    template: `
      <div class="draft-list-item with-image" ng-init="draftImage = (fakePost | catchPostImage)">
        <div class="item-header">
          <div class="item-info-bar">
            <div class="item-author-pic" author-bg-img-style author="{{ fakePost.author }}"></div>
              <div class="item-info-right-side">
                <span class="item-author"><a>{{ fakePost.author }}</a></span>
                <span class="item-author-reputation">{{ fakePost.author_reputation|authorReputation|number:0 }}</span>
                <span class="item-parent">{{ 'IN' | translate }} <a>{{ fakePost.category }}</a></span>
                <span class="item-date"><a title="{{ post.created|dateFormatted }}"> {{draft.created|timeAgo}}</a></span>
              </div>
          </div>
        </div>
        <div class="item-body">
            <a class="item-image" ng-if="draftImage" ng-click="clicked(draft)">
              <img ng-src="{{ draftImage }}" fallback-src="img/fallback.png">
            </a>
            <a class="item-image" ng-if="!draftImage" ng-click="clicked(draft)">
              <img ng-src="img/noimage.png">
            </a>
            <h2 class="item-body-title"><a  ng-click="clicked(draft)">{{ draft.title }}</a></h2>
            <div class="item-body-summary">
                <a ng-click="clicked(draft)" ng-bind-html="draft.body | postSummary"></a> &nbsp;
            </div>
        </div>
        <div class="item-footer">
          <div class="item-edit"><a ng-click="clicked(draft)"><i class="fa fa-pencil"></i></a></div>
          <div class="item-delete"><a ng-click="deleteClicked(draft)"><i class="fa fa-times"></i></a></div>
        </div>
    </div>
    `,
    controller: ($scope, $rootScope, $location, $filter, $window, eSteemService, activeUsername) => {

      $scope.deleting = false;
      $scope.tags = $scope.draft.tags ? $scope.draft.tags.replace(/ /g, ', ') : '';

      $scope.fakePost = {
        json_metadata: '',
        body: $scope.draft.body,
        author: activeUsername(),
        category: $scope.tags.split(',')[0],
        author_reputation: $rootScope.userProps ? $rootScope.userProps.reputation : 0
      };

      $scope.clicked = (draft) => {
        $rootScope.editorDraft = {
          id: draft._id,
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
            $rootScope.showError('Could not deleted draft!');
          }).then(() => {
            $scope.deleting = false;
          });
        }
      }
    }
  };
};
