import {diff_match_patch} from 'diff-match-patch';

const dmp = new diff_match_patch();

import {markDown2Html} from '../filters/markdown-2-html';

const make_diff = (str1, str2) => {
  const d = dmp.diff_main(str1, str2);
  dmp.diff_cleanupSemantic(d);
  return dmp.diff_prettyHtml(d).replace(/&para;/g, '&nbsp;');
};


export default ($scope, $rootScope, $uibModalInstance, $filter, $sce, $timeout, eSteemService, content) => {

  $scope.list = [];
  $scope.showDiff = {val: false};

  $scope.title = '';
  $scope.tags = '';
  $scope.body = '';

  const buildList = (raw) => {
    const t = [];

    let h = '';
    for (let l = 0; l < raw.length; l += 1) {

      if (raw[l].body.startsWith('@@')) {
        const p = dmp.patch_fromText(raw[l].body);
        h = dmp.patch_apply(p, h)[0];
        raw[l].body = h;
      } else {
        h = raw[l].body
      }

      t.push(
        {
          'v': raw[l].v,
          'title': raw[l].title,
          'body': h,
          'timestamp': raw[l].timestamp,
          'tags': raw[l].tags.join(', ')
        }
      )
    }

    for (let l = 0; l < t.length; l += 1) {
      const p = (l > 0 ? (l - 1) : l);

      t[l].title_diff = make_diff(t[p].title, t[l].title);
      t[l].body_diff = make_diff(t[p].body, t[l].body);
      t[l].tags_diff = make_diff(t[p].tags, t[l].tags);
    }

    $scope.list = t;
  };

  $scope.loading = true;
  eSteemService.commentHistory(content.author, content.permlink).then((resp) => {
    buildList(resp.data.list);
    $scope.select(1);
    $scope.loading = false;
  }).catch((e) => {
    $rootScope.showError('Could not fetch version list');
  });

  const loadSelected = () => {
    const i = $scope.selected - 1;

    if ($scope.showDiff.val) {
      $scope.title = $sce.trustAsHtml($scope.list[i].title_diff);
      $scope.body = $sce.trustAsHtml($scope.list[i].body_diff);
      $scope.tags = $sce.trustAsHtml($scope.list[i].tags_diff);
    } else {
      $scope.title = $sce.trustAsHtml($scope.list[i].title);
      $scope.body = $sce.trustAsHtml(markDown2Html($scope.list[i].body));
      $scope.tags = $sce.trustAsHtml($scope.list[i].tags);
    }
  };

  $scope.select = (v) => {
    $scope.selected = v;
    loadSelected();
  };

  $scope.toggleDiff = () => {
    loadSelected();
  }
};
