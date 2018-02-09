export const postListItemDir = () => {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      post: '='
    },
    link: ($scope, $element) => {

    },
    // Instead of templateUrl, this way angular can render faster
    template: `<div class="post-list-item" ng-init="postImage = (post | catchPostImage)">
      <div class="post-header">
        <div class="post-author-left">
          <div class="post-author-pic">
            <img ng-src="https://steemitimages.com/u/{{ post.author }}/avatar/small">
          </div>
        </div>
        <div class="post-author-right">
          <span class="post-author-name"><a ng-click="authorClicked(post)">{{ post.author }}</a></span>
          <span class="post-author-reputation">{{ post.author_reputation|authorReputation|number:0 }}</span>
        </div>
        <div class="post-info">
          <span class="post-info-cat"><a ng-click="parentClicked(post)">in {{ post.parent_permlink }}</a></span>
          <span class="post-info-date"><a ng-click="createdClicked(post)"> {{post.created|timeAgo}}</a></span>
        </div>
      </div>
      <div class="post-body" ng-class="{'with-image': postImage}">
        <div class="post-image" ng-if="postImage">
          <a ng-click="imageClicked(post)">
            <img ng-src="{{ postImage }}">
          </a>
        </div>
        <div class="post-body-content">
          <h2 class="post-body-content-title">
            <a ng-click="titleClicked(post)">{{ post.title }}</a>
          </h2>
          <div class="post-body-content-summary"><a ng-click="summaryClicked(post)" ng-bind-html="post.body | postSummary"></a></div>
          <div class="post-body-content-controls">
            <div class="control-vote">
              <div class="up-vote">
                <a ng-click="upVoteClicked(post)" >
                  <i class="fa fa-chevron-circle-up"></i>
                </a>
              </div>
              <div class="post-total">
                <a ng-click="totalClicked(post)">
                  <span class="cur-prefix">$</span> {{post | sumPostTotal:1 | number}}
                </a>
              </div>
            </div>
            <div class="control-voters">
              <a ng-click="votesClicked(post)">
                <i class="fa fa-users"></i> {{ post.net_votes }}
              </a>
            </div>
            <div class="control-comments">
              <a ng-click="commentsClicked(post)">
                <i class="fa fa-comments"></i> {{ post.children }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
    controller: ($scope) => {
      // console.log(typeof $scope.post)

      $scope.fn = () => {

      };
    }
  };
};
