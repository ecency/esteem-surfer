import {authorReputation} from '../filters/author-reputation'

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
      <div class="comment-list-item" ng-class="{'selected': comment._selected_, 'deleting': deleting, 'deleted': deleted, 'bad': isBad }">
        <div class="comment-list-item-inner">
          <div class="comment-author-pic" author-bg-img-style author="{{ comment.author }}"></div>
          <div class="comment-header">
           <span class="comment-author"><author-name author-data="comment.author_data"></author-name> </span>
            <span class="comment-author-reputation">{{ comment.author_reputation|authorReputation|number:0 }}</span>
            <span class="comment-date"><a ng-click="goComment()" ng-class="{'no-child': comment.comments.length==0}" title="{{ comment.created|dateFormatted }}"> {{comment.created|timeAgo}}</a></span>
            <a ng-click="reveal()" class="comment-reveal">Reveal Comment</a>
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
          <div class="comment-extra-tools">
            <div class="comment-flagging">
              <a ng-class="{'flagged': flagged, 'flagging': flagging}" ng-click="" login-required required-keys="'posting'" on-login-success="flagClicked()">
                <i ng-if="!flagging" class="fa fa-flag"></i>
                <i ng-if="flagging" class="fa fa-spin fa-spinner fa-circle-o-notch"></i>
              </a>
            </div>
          </div>
        </div>
        <comment-editor ng-if="commentFlag" content="comment" mode="{{ commentMode }}" on-cancel="onCommentEditorCanceled()" after-success="afterNewComment"></comment-editor>
        <comment-list comments="comment.comments"></comment-list>
      </div>
    `,
    controller: ($scope, $rootScope, $filter, $timeout, $location, $window, $confirm, steemAuthenticatedService, activeUsername) => {

      const activeUser = activeUsername();

      if (!$scope.comment.comments) {
        $scope.comment.comments = [];
      }

      $scope.canEdit = false;
      $scope.deleting = false;
      $scope.deleted = false;

      const detectCanEdit = () => {
        $scope.canEdit = (activeUser === $scope.comment.author);
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


      $scope.flagged = false;
      $scope.canFlag = !(activeUser === $scope.comment.author);
      $scope.flagging = false;


      if ($scope.canFlag && activeUser) {
        for (let vote of $scope.comment.active_votes) {
          if (vote.voter === activeUser && vote.percent < 0) {
            $scope.flagged = true;
          }
        }
      }


      $scope.flagClicked = () => {


        $confirm($filter('translate')('ARE_YOU_SURE'), $filter('translate')('FLAGGING_TEXT'), () => {
          const author = $scope.comment.author;
          const permlink = $scope.comment.permlink;

          $scope.flagging = true;
          steemAuthenticatedService.vote(author, permlink, -10000).then((resp) => {
            $rootScope.$broadcast('CONTENT_VOTED', {
              author: author,
              permlink: permlink,
              weight: -1
            });
          }).catch((e) => {
            $rootScope.showError(e);
          }).then(() => {
            $scope.flagging = false;
          });
        });
      };

      $rootScope.$on('CONTENT_VOTED', (r, d) => {
        if ($scope.comment.author === d.author && $scope.comment.permlink === d.permlink) {
          $scope.flagged = d.weight < 0;
        }
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
      };

      $scope.isBad = $scope.comment.net_rshares < 0 || $scope.comment.author_data.reputation < 0;

      $scope.reveal = () => {
        $scope.isBad = false;
      };

      $scope.goComment = () => {
        const tag = $scope.comment.url.split('/')[1];
        $rootScope.selectedPost = null;
        let u = `/post/${tag}/${ $scope.comment.author}/${ $scope.comment.permlink}`;
        $location.path(u);
      }
    }
  };
};
