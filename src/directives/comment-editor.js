export default () => {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      commentBody: '<',
      content: '<',
      mode: '@',
      onCancel: '&',
      afterSuccess: '&'
    },
    link: (scope, element, attrs) => {
      scope._id = Math.random() * 10000 | 0;

      scope.removeDirective = function () {
        scope.$destroy();
        element.remove();
      };
    },
    template: `<div class="comment-editor">
        <div class="editing-part">
          <content-editor-controls target-elem="#reply-editor-{{ _id }}"></content-editor-controls>
          <content-editor place-holder="Write your reply" body="commentBody" elem-id="reply-editor-{{ _id }}"></content-editor>
        </div>
        <div class="editor-buttons">
          <button class="btn btn-primary btn-sm" ng-disabled="!commentBody || sending" ng-click="send()">
            <span ng-if="mode=='reply'"><i class="fa fa-spin fa-spinner fa-circle-o-notch" ng-if="sending"></i> {{ 'REPLY' | translate }}</span>
            <span ng-if="mode=='edit'"><i class="fa fa-spin fa-spinner fa-circle-o-notch" ng-if="sending"></i> {{ 'SAVE' | translate }}</span>
          </button>
          <button class="btn btn-default btn-sm" ng-disabled="sending" ng-click="cancel()">{{ 'CANCEL' | translate }}</button>
        </div>
        <div class="preview-part" ng-if="commentBody">
          <div class="preview-part-title">{{ 'PREVIEW' | translate }}</div>
          <div class="markdown-view mini-markdown" ng-bind-html="commentBody | markDown2Html"></div>
        </div>
     </div>`,
    controller: ($scope, $rootScope, steemAuthenticatedService, steemService, activeUsername, appVersion) => {

      if ($scope.mode === 'edit') {
        $scope.commentBody = $scope.content.body;
      }

      const makeReplyPermlink = (toAuthor) => {
        const t = new Date();
        const timeFormat = t.getFullYear().toString() + (t.getMonth() + 1).toString() + t.getDate().toString() + "t" + t.getHours().toString() + t.getMinutes().toString() + t.getSeconds().toString() + t.getMilliseconds().toString() + "z";

        return "re-" + toAuthor.replace(/\./g, "") + "-" + timeFormat;
      };

      const makeCommentOptions = (author, permlink) => {
        return {
          allow_curation_rewards: true,
          allow_votes: true,
          author: author,
          permlink: permlink,
          max_accepted_payout: '1000000.000 SBD',
          percent_steem_dollars: 10000,
          extensions: [[0, {'beneficiaries': [{'account': 'esteemapp', 'weight': 1000}]}]]
        }
      };

      $scope.send = () => {
        const c = $scope.content;

        let parentAuthor, parentPermlink, author, permlink, options = null;

        const body = $scope.commentBody.trim();

        const jsonMetadata = {
          tags: c.json_metadata ? JSON.parse(c.json_metadata).tags : ['esteem'],
          app: 'esteem/' + appVersion + '-surfer',
          format: 'markdown+html',
          community: 'esteem'
        };

        if ($scope.mode === 'edit') {
          // Edit
          parentAuthor = c.parent_author;
          parentPermlink = c.parent_permlink;
          author = c.author;
          permlink = c.permlink;

          let bExist = false;

          for (let b of c.beneficiaries) {
            if (b && b.account === 'esteemapp') {
              bExist = true;
              break;
            }
          }

          if (!bExist) {
            options = makeCommentOptions(c.author, c.permlink);
          }
        } else if ($scope.mode === 'reply') {
          // New comment
          parentAuthor = c.author;
          parentPermlink = c.permlink;
          author = activeUsername();
          permlink = makeReplyPermlink(c.author);
          options = makeCommentOptions(author, permlink);
        }

        $scope.sending = true;
        steemAuthenticatedService.comment(parentAuthor, parentPermlink, author, permlink, '', body, jsonMetadata, options).then((resp) => {
          steemService.getContent(author, permlink).then((resp) => {
            $scope.afterSuccess()(resp, $scope.mode);
          }).catch((e) => {
            $rootScope.showError(e);
          }).then(() => {
            $scope.removeDirective();
          });
        }).catch((e) => {
          $rootScope.showError(e);
        }).then(() => {
          $scope.sending = false;
        });
      };

      $scope.cancel = () => {
        $scope.removeDirective();

        if ($scope.onCancel) {
          $scope.onCancel();
        }
      };

      $rootScope.$on('userLoggedOut', () => {
        $scope.removeDirective();
      });
    }
  };
};
