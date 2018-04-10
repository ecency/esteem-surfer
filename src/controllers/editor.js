import getSlug from 'speakingurl';

const createPermlink = (title) => {
  const rnd = (Math.random() + 1).toString(16).substring(2);
  let slug = getSlug(title);

  let perm = `${slug.toString()}-${rnd}`;

  // STEEMIT_MAX_PERMLINK_LENGTH
  if (perm.length > 255) {
    perm = perm.substring(perm.length - 255, perm.length)
  }

  // only letters numbers and dashes
  perm = perm.toLowerCase().replace(/[^a-z0-9-]+/g, '');
  return perm;
};

export const extractMetadata = (body) => {

  const urlReg = /(\b(https?|ftp):\/\/[A-Z0-9+&@#\/%?=~_|!:,.;-]*[-A-Z0-9+&@#\/%=~_|])/gim;
  const userReg = /(^|\s)(@[a-z][-\.a-z\d]+[a-z\d])/gim;
  const imgReg = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/gim;

  const out = {};

  const mUrls = body.match(urlReg);
  const mUsers = body.match(userReg);

  const matchedImages = [];
  const matchedLinks = [];
  const matchedUsers = [];

  if (mUrls) {
    for (let i = 0; i < mUrls.length; i++) {
      const ind = mUrls[i].match(imgReg);
      if (ind) {
        matchedImages.push(mUrls[i]);
      } else {
        matchedLinks.push(mUrls[i]);
      }
    }
  }

  if (matchedLinks.length) {
    out['links'] = matchedLinks;
  }
  if (matchedImages.length) {
    out['image'] = matchedImages;
  }

  if (mUsers) {
    for (let i = 0; i < mUsers.length; i++) {
      matchedUsers.push(mUsers[i].trim().substring(1));
    }
  }

  if (matchedUsers.length) {
    out['users'] = matchedUsers;
  }

  return out;
};

export default ($scope, $rootScope, $routeParams, $filter, $location, $timeout, eSteemService, activeUsername, steemAuthenticatedService, editorService, helperService, appVersion) => {

  const makeOptions = (author, permlink, operationType) => {
    const a = {
      allow_curation_rewards: true,
      allow_votes: true,
      author: author,
      permlink: permlink,
      max_accepted_payout: '1000000.000 SBD',
      percent_steem_dollars: 10000,
      extensions: [[0, {'beneficiaries': [{'account': 'esteemapp', 'weight': 1000}]}]]
    };

    switch (operationType) {
      case 'default':
        a.max_accepted_payout = '1000000.000 SBD';
        a.percent_steem_dollars = 10000;
        break;
      case 'sp':
        a.max_accepted_payout = '1000000.000 SBD';
        a.percent_steem_dollars = 0;
        break;
      case 'dp':
        a.max_accepted_payout = '0.000 SBD';
        a.percent_steem_dollars = 10000;
        break;
    }

    return a;
  };

  $scope.title = undefined;
  $scope.body = $scope.tempBody = undefined;
  $scope.tags = undefined;
  $scope.operationType = 'default';
  $scope.vote = false;

  $scope.saving = false;
  $scope.scheduling = false;
  $scope.posting = false;
  $scope.processing = false;

  $scope.fromDraft = false;
  $scope.editMode = false;

  if ($rootScope.editorDraft) {
    $scope.title = $rootScope.editorDraft.title;
    $scope.body = $scope.tempBody = $rootScope.editorDraft.body;
    $scope.tags = $rootScope.editorDraft.tags;

    $rootScope.editorDraft = null;

    $scope.fromDraft = true;
  } else if ($rootScope.editorPost) {
    $scope.editMode = true;

  } else {
    $scope.title = editorService.getTitle();
    $scope.body = $scope.tempBody = editorService.getBody();
    $scope.tags = editorService.getTags();
  }

  let bodyTimeout = null;

  $scope.$watch('tempBody', (newVal, oldVal) => {
    if (newVal === oldVal) {
      return;
    }

    if (newVal === $scope.body) {
      return;
    }

    if (bodyTimeout !== null) {
      $timeout.cancel(bodyTimeout);
      bodyTimeout = null;
    }

    bodyTimeout = $timeout(() => {
      $scope.body = newVal;
    }, 500);
  });

  $scope.$watch('title', (newVal, oldVal) => {
    if (newVal !== undefined) {
      editorService.setTitle(newVal);
    }
  });

  $scope.$watch('body', (newVal, oldVal) => {
    if (newVal !== undefined) {
      editorService.setBody(newVal);
    }
  });

  $scope.$watch('tags', (newVal, oldVal) => {
    if (newVal !== undefined) {
      editorService.setTags(newVal);
    }
  });

  const validate = () => {
    const eTitle = document.querySelector('#content-title');
    const eBody = document.querySelector('#reply-editor-1 textarea');
    const eTags = document.querySelector('#content-tags');

    eTitle.classList.remove('error');
    eBody.classList.remove('error');
    eTags.classList.remove('error');

    if (!$scope.title) {
      eTitle.classList.add('error');
      eTitle.focus();
      return false;
    }

    if (!$scope.body) {
      eBody.classList.add('error');
      eBody.focus();
      return false;
    }

    if (!$scope.tags) {
      eTags.classList.add('error');
      eTags.focus();
      return false;
    }

    return true;
  };

  $scope.save = () => {
    if (!validate()) {
      return false;
    }

    $scope.saving = true;
    $scope.processing = true;
    eSteemService.addDraft(activeUsername(), $scope.title, $scope.body, $scope.tags).then((resp) => {
      $rootScope.showSuccess($filter('translate')('POST_IS_DRAFT'));
      $location.path('/drafts');
    }).catch((e) => {
      $rootScope.showError(e);
    }).then(() => {
      $scope.saving = false;
      $scope.processing = false;
    });
  };

  $scope.schedule = () => {
    if (!validate()) {
      return false;
    }

  };

  $scope.post = () => {
    if (!validate()) {
      return false;
    }


    if($scope.editMode){

    } else {
      const permlink = createPermlink($scope.title);
      const meta = extractMetadata($scope.body);
      const tags = $scope.tags.split(' ');

      const jsonMetadata = Object.assign({}, meta, {
        tags: tags,
        app: 'esteem-surfer/' + appVersion,
        format: 'markdown+html',
        community: 'esteem'
      });

      const parentPermlink = tags[0];
      const author = activeUsername();
      const title = $scope.title;
      const body = $scope.body.trim();
      const options = makeOptions(activeUsername(), permlink, $scope.operationType);
      const voteWeight = $scope.vote ? (helperService.getVotePerc(activeUsername()) * 100) : null;

      $scope.posting = true;
      $scope.processing = true;

      steemAuthenticatedService.comment('', parentPermlink, author, permlink, title, body, jsonMetadata, options, voteWeight).then((resp) => {
        $rootScope.showSuccess($filter('translate')('POST_SUBMITTED'));
        $rootScope.selectedPost = null;
        $location.path(`/post/${parentPermlink}/${author}/${permlink}`);
      }).catch((e) => {
        $rootScope.showError(e);
      }).then(() => {
        $scope.posting = false;
        $scope.processing = false;
      });
    }


  }
};
