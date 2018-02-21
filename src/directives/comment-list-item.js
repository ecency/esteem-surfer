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
           <span class="comment-author"><a ng-click="authorClicked()">{{ comment.author }}</a></span>
            <span class="comment-author-reputation">{{ comment.author_reputation|authorReputation|number:0 }}</span>
            <span class="comment-date"><span title="{{ comment.created|dateFormatted }}"> {{comment.created|timeAgo}}</span></span>
          </div>
          <div class="comment-body markdown-view mini-markdown" ng-bind-html="comment.body | markDown2Html"></div>
          <div class="comment-footer"></div>
        </div>
        <comment-list comments="comment.replies"></comment-list>
      </div>
    `,
    controller: ($scope, $rootScope) => {

    }
  };
};
