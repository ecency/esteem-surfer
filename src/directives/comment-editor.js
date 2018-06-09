import steem from 'steem';

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
          <div class="pull-left">
            <label><input type="checkbox" ng-model="encrypt.val" ng-disabled="!canEncrypt"> Encrypt <span class="text-danger" ng-if="!canEncrypt"><em>(cannot encrypt with steem connect login)</em></span></label> 
          </div>
          <div class="pull-right">
            <button class="btn btn-primary btn-sm" ng-disabled="!commentBody || sending" ng-click="send()">
              <span ng-if="mode=='reply'"><i class="fa fa-spin fa-spinner fa-circle-o-notch" ng-if="sending"></i> {{ 'REPLY' | translate }}</span>
              <span ng-if="mode=='edit'"><i class="fa fa-spin fa-spinner fa-circle-o-notch" ng-if="sending"></i> {{ 'SAVE' | translate }}</span>
            </button>
            <button class="btn btn-default btn-sm" ng-disabled="sending" ng-click="cancel()">{{ 'CANCEL' | translate }}</button>
          </div>
        </div>
        <div class="preview-part" ng-if="commentBody">
          <div class="preview-part-title">{{ 'PREVIEW' | translate }}</div>
          <div class="markdown-view mini-markdown" ng-bind-html="commentBody | markDown2Html"></div>
        </div>
     </div>`,
    controller: ($scope, $rootScope, $filter, steemAuthenticatedService, steemService, activeUsername, cryptoService, appVersion) => {

      if ($scope.mode === 'edit') {
        $scope.commentBody = $filter('commentBody')($scope.content);
      }

      let jsonMeta = {};
      try {
        jsonMeta = JSON.parse($scope.content.json_metadata);
      } catch (e) { }

      $scope.encrypt = {
        val: jsonMeta.encrypted === 1
      };

      // Steem connect login cannot encrypt
      if($rootScope.user && $rootScope.user.type === 's'){
        $scope.canEncrypt = true;
      } else {
        $scope.canEncrypt = false;
        $scope.encrypt.val = false;
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

        let body = $scope.commentBody.trim();

        const jsonMetadata = {
          tags: c.json_metadata ? JSON.parse(c.json_metadata).tags : ['esteem'],
          app: 'esteem/' + appVersion + '-surfer',
          format: 'markdown+html',
          community: 'esteem',
          encrypted: $scope.encrypt.val ? 1 : 0
        };

        if ($scope.encrypt.val) {
          const senderPrivateKey = cryptoService.decryptKey($rootScope.user.keys['posting']);
          const receiverPublicKey = $scope.content.author_data.posting.key_auths.pop()[0];

          body = steem.memo.encode(senderPrivateKey, receiverPublicKey, `#${body}`);
        }

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
          const routePath = `/${parentPermlink}/@${author}/${permlink}`;
          const contentPath = `${author}/${permlink}`;

          steemService.getState(routePath).then((resp) => {
            const content = resp.content[contentPath];
            content.author_data = resp.accounts[author];
            $scope.afterSuccess()(content, $scope.mode);
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
