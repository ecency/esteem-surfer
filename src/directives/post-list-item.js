export const postListItemDirective = function () {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      post: '='
    },
    link: function ($scope, $element) {

    },
    // Instead of templateUrl, this way angular can render faster
    template: `<div class="post-list-item">
      <div class="post-header">
        <div class="post-author-left">
          <div class="post-author-pic">
            <img ng-src="https://steemitimages.com/u/{{ post.author }}/avatar/small">
          </div>
        </div>
        <div class="post-author-right">
          <span class="post-author-name"><a href="#">{{ post.author }}</a></span>
          <span class="post-author-reputation">{{ post.author_reputation|authorReputation|number:0 }}</span>
        </div>
        <div class="post-info">
          <span class="post-info-cat"><a href="#">in {{ post.parent_permlink }}</a></span>
          <span class="post-info-date"><a href="#"> {{post.created|timeAgo}}</a></span>
        </div>
      </div>
      <div class="post-body with-image">
        <div class="post-image">
          <a href="#">
            <img ng-src="{{ post | catchPostImage }}">
          </a>
        </div>
        <div class="post-body-content">
          <h2 class="post-body-content-title">
            <a href="#">{{ post.title }}</a>
          </h2>
          <div class="post-body-content-summary"><a href="#" ng-bind-html="post.body | postSummary"></a></div>
          <div class="post-body-content-controls">
            <div class="control-vote">
              <div class="up-vote">
                <a href="#">
                  <i class="fa fa-chevron-circle-up"></i>
                </a>
              </div>
              <div class="vote-money">
                <a href="#">
                  <span class="money-prefix">$</span> {{post | sumPostTotal:1 | number}}
                </a>
              </div>
            </div>
            <div class="control-voters">
              <a href="#">
                <i class="fa fa-users"></i> {{ post.net_votes }}
              </a>
            </div>
            <div class="control-comments">
              <a href="#">
                <i class="fa fa-comments"></i> {{ post.children }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
    controller: function ($scope) {
      // console.log(typeof $scope.post)

      $scope.fn = function () {

      };
    }
  };
};
