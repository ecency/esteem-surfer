export default () => {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      comment: '='
    },
    link: (scope, element, attrs) => {
      scope.removeDirective = function () {
        scope.$destroy();
        element.remove();
      };
    },
    template: `
      <div class="comment-list-item" ng-class="{'selected': comment._selected_, 'deleting': deleting, 'deleted': deleted}">
        <div class="comment-list-item-inner">
          <div class="comment-author-pic" author-bg-img-style author="{{ comment.author }}"></div>
          <div class="comment-header">
           <span class="comment-author"><author-name author-data="comment.author_data"></author-name> </span>
            <span class="comment-author-reputation">{{ comment.author_reputation|authorReputation|number:0 }}</span>
            <span class="comment-date"><span title="{{ comment.created|dateFormatted }}"> {{comment.created|timeAgo}}</span></span>
          </div>
          <div class="comment-body markdown-view mini-markdown" ng-bind-html="comment.body | markDown2Html"></div>
          <div class="comment-footer">
            <div class="comment-voting">
              <div class="comment-up-vote">
                <content-vote content="comment"></content-vote>
              </div>
              <div class="comment-total">
                <content-payout-info content="comment"></content-payout-info>
              </div>
            </div>
            <div class="comment-voters">
              <content-voters-info content="comment"></content-voters-info>
            </div>
            <div class="comment-reply">
              <a ng-click="" login-required required-keys="'posting'" on-login-success="replyClicked()">{{ 'REPLY' | translate }}</a>
            </div>
            <div class="comment-edit" ng-if="canEdit"><a ng-click="" login-required required-keys="'posting'" on-login-success="editClicked()" title="{{ 'EDIT' | translate }}"><i class="fa fa-pencil"></i></a></div>
            <div class="comment-delete" ng-if="canEdit"><a ng-click="" login-required required-keys="'posting'" on-login-success="deleteClicked()" title="{{ 'REMOVE' | translate }}"><i class="fa fa-spin fa-spinner fa-circle-o-notch" ng-if="deleting"></i><i class="fa fa-times" ng-if="!deleting"></i></a></div>
          </div>
        </div>
        <comment-editor ng-if="commentFlag" content="comment" mode="{{ commentMode }}" on-cancel="onCommentEditorCanceled()" after-success="afterNewComment"></comment-editor>
        <comment-list comments="comment.comments"></comment-list>
      </div>
    `,
    controller: ($scope, $rootScope, $filter, $timeout, $window, steemAuthenticatedService, activeUsername) => {

      if (!$scope.comment.comments) {
        $scope.comment.comments = [];
      }

      $scope.canEdit = false;
      $scope.deleting = false;
      $scope.deleted = false;

      const detectCanEdit = () => {
        $scope.canEdit = (activeUsername() === $scope.comment.author);
      };

      detectCanEdit();

      $rootScope.$on('userLoggedOut', () => {
        detectCanEdit();
      });

      $rootScope.$on('userLoggedIn', () => {
        detectCanEdit();
      });

      $scope.deleteClicked = () => {
        if ($window.confirm($filter('translate')('ARE_YOU_SURE'))) {
          $scope.deleting = true;

          steemAuthenticatedService.deleteComment($scope.comment.author, $scope.comment.permlink).then((resp) => {
            $scope.deleted = true;

            $timeout(() => {
              $scope.removeDirective();
            }, 100);
          }).catch((e) => {
            $rootScope.showError(e);
          }).then(() => {
            $scope.deleting = false;
          });
        }
      };

      $scope.commentFlag = false;

      $scope.replyClicked = () => {
        $rootScope.$broadcast('commentEditorOpening');

        $timeout(() => {
          $scope.commentMode = 'reply';
          $scope.commentFlag = true;
        }, 100);
      };

      $scope.editClicked = () => {
        $rootScope.$broadcast('commentEditorOpening');

        $timeout(() => {
          $scope.commentMode = 'edit';
          $scope.commentFlag = true;
        }, 100);
      };

      $rootScope.$on('commentEditorOpening', () => {
        $scope.commentFlag = false;
      });

      $scope.onCommentEditorCanceled = () => {
        $scope.commentFlag = false;
      };

      $scope.afterNewComment = (newComment, mode) => {
        if (mode === 'reply') {
          $scope.comment.comments.push(newComment);
        } else if (mode === 'edit') {
          $scope.comment.body = newComment.body;
        }
      }
    }
  };
};
