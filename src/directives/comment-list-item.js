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
      <div class="comment-list-item" ng-class="{'selected': comment._selected_}">
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
              <a ng-click="replyClicked(post)">{{ 'REPLY' | translate }}</a>
            </div>
          </div>
        </div>
        <comment-list comments="comment.comments"></comment-list>
      </div>
    `,
    controller: ($scope, $rootScope, $filter, $uibModal) => {


    }
  };
};
