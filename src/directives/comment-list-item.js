export default () => {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      comment: '<'
    },
    link: (scope, element, attrs) => {
      scope.removeDirective = function () {
        scope.$destroy();
        element.remove();
      };

      scope.dock2ReplyWindow = () => {
        return;
        const el = element[0];

        document.querySelector('#content-main').scrollTop = 600;
      }

    },
    template: `
      <div class="comment-list-item" ng-class="{'selected': comment._selected_, 'deleting': deleting}">
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
            <div class="comment-voters" ng-if="comment.net_votes>0">
              <content-voters-info content="comment"></content-voters-info>
            </div>
            <div class="comment-reply">
              <a ng-click="" login-required required-keys="'posting'" on-login-success="replyClicked">{{ 'REPLY' | translate }}</a>
            </div>
            <div class="comment-edit" ng-if="canEdit"><a ng-click="" login-required required-keys="'posting'" on-login-success="editClicked" title="{{ 'EDIT' | translate }}"><i class="fa fa-pencil"></i></a></div>
            <div class="comment-delete" ng-if="canEdit"><a ng-click="" login-required required-keys="'posting'" on-login-success="deleteClicked" title="{{ 'REMOVE' | translate }}"><i class="fa fa-spin fa-spinner fa-circle-o-notch" ng-if="deleting"></i><i class="fa fa-times" ng-if="!deleting"></i></a></div>
          </div>
        </div>
        <comment-list comments="comment.comments"></comment-list>
      </div>
    `,
    controller: ($scope, $rootScope, $window, steemAuthenticatedService, activeUsername) => {

      $scope.canEdit = false;
      $scope.deleting = false;

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

      $scope.replyClicked = () => {
        $scope.dock2ReplyWindow();
        $rootScope.openReplyWindow($scope.comment, (resp) => {
          $scope.comment.comments.push(resp);
          $rootScope.closeReplyWindow();
        });
      };

      $scope.editClicked = () => {
        $rootScope.openReplyWindow($scope.comment, (resp) => {
          $scope.comment.body = resp.body;
          $rootScope.closeReplyWindow();
        }, true);
      };

      $scope.deleteClicked = () => {
        if ($window.confirm('Are you sure?')) {
          $scope.deleting = true;
          steemAuthenticatedService.deleteComment($scope.comment.author, $scope.comment.permlink).then((resp) => {
            $scope.removeDirective();
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
