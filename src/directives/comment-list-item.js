export default () => {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      comment: '='
    },
    link: ($scope, $element) => {

    },
    template: `
      <div class="comment-list-item">
        <div class="comment-list-item-inner">
          <div class="comment-author-pic" author-bg-img-style author="{{ comment.author }}"></div>
          <div class="comment-header">
           <span class="comment-author"><author-name-popover author-data="comment.author_data"></author-name-popover> </span>
            <span class="comment-author-reputation">{{ comment.author_reputation|authorReputation|number:0 }}</span>
            <span class="comment-date"><span title="{{ comment.created|dateFormatted }}"> {{comment.created|timeAgo}}</span></span>
          </div>
          <div class="comment-body markdown-view mini-markdown" ng-bind-html="comment.body | markDown2Html"></div>
          <div class="comment-footer">
            <div class="comment-voting">
              <div class="comment-up-vote">
                <a ng-click="upVoteClicked()">
                  <i class="fa fa-chevron-circle-up"></i>
                </a>
              </div>
              <div class="comment-total">
                <content-payout-info content="comment"></content-payout-info>
              </div>
            </div>
            <div class="comment-voters" ng-if="comment.net_votes>0">
              <a ng-click="votersClicked(post)">
               {{ comment.net_votes }} {{ 'VOTES' | translate | lowercase }}
              </a>
            </div>
            <div class="comment-reply">
              <a ng-click="replyClicked(post)">{{ 'REPLY' | translate }}</a>
            </div>
          </div>
        </div>
        <comment-list comments="comment.comments"></comment-list>
      </div>
    `,
    controller: ($scope, $rootScope, $filter, $uibModal) => {
      $scope.votersClicked = (post) => {
        $uibModal.open({
          templateUrl: 'templates/post-voters.html',
          controller: 'postVotersCtrl',
          windowClass: 'postVotersModal',
          resolve: {
            post: function () {
              return $scope.comment;
            }
          }
        }).result.then(function (data) {
          // Success
        }, function () {
          // Cancel
        });
      };

    }
  };
};
