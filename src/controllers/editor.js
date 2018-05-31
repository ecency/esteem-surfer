import getSlug from 'speakingurl';
import moment from 'moment';

import {diff_match_patch} from 'diff-match-patch';
import {Buffer} from 'buffer';

require('moment-timezone');

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

const makeJsonMetadata = (meta, tags, appVer) => {
  return Object.assign({}, meta, {
    tags: tags,
    app: 'esteem/' + appVer + '-surfer',
    format: 'markdown+html',
    community: 'esteem'
  });
};

const createPatch = (text1, text2) => {
  const dmp = new diff_match_patch();
  if (!text1 && text1 === '') return undefined;
  const patches = dmp.patch_make(text1, text2);
  const patch = dmp.patch_toText(patches);
  return patch;
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

export default ($scope, $rootScope, $routeParams, $filter, $location, $window, $timeout, $uibModal, eSteemService, steemService, activeUsername, steemAuthenticatedService, editorService, helperService, appVersion) => {

  const hasPermission = (account) => {
    let hasPerm = false;

    account.posting.account_auths.forEach(function (auth) {
      if (auth[0] === 'esteemapp') {
        hasPerm = true;
      }
    });

    return hasPerm;
  };

  $scope.title = undefined;
  $scope.body = $scope.tempBody = undefined;
  $scope.tags = undefined;
  $scope.operationType = 'default';
  $scope.vote = { checked: false};

  $scope.saving = false;
  $scope.scheduling = false;
  $scope.posting = false;
  $scope.updating = false;
  $scope.fetchingPermission = false;
  $scope.processing = false;
  $scope.fetchingContent = false;

  $scope.fromDraft = false;
  $scope.editMode = false;

  let editingContent = null;

  if ($rootScope.editorDraft) {
    $scope.title = $rootScope.editorDraft.title;
    $scope.body = $scope.tempBody = $rootScope.editorDraft.body;

    // replace commas with space. replace double spaces with single space.
    $scope.tags = $rootScope.editorDraft.tags.replace(/,/g, ' ').replace(/  /g, ' ');

    $rootScope.editorDraft = null;

    $scope.fromDraft = true;
  } else if ($routeParams.author && $routeParams.permlink) {

    $scope.fetchingContent = true;
    steemService.getContent($routeParams.author, $routeParams.permlink).then((resp) => {
      $scope.editMode = true;
      editingContent = resp;

      $scope.title = resp.title;
      $scope.body = $scope.tempBody = resp.body;
      $scope.tags = JSON.parse(resp.json_metadata).tags.join(' ');
    }).catch((e) => {

    }).then(() => {
      $scope.fetchingContent = false;
    })

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
    clearTitleValidation();

    if ($scope.editMode) {
      return;
    }

    if (newVal !== undefined) {
      editorService.setTitle(newVal);
    }
  });

  $scope.$watch('body', (newVal, oldVal) => {
    clearBodyValidation();

    if ($scope.editMode) {
      return;
    }

    if (newVal !== undefined) {
      editorService.setBody(newVal);
    }
  });

  $scope.$watch('tags', (newVal, oldVal) => {
    clearTagsValidation();
    if (newVal) {
      const r = validateTags(newVal);
      if (r !== true) {
        const eTags = document.querySelector('#content-tags');
        eTags.classList.add('error');
        $scope.tagErr = r;
      }
    }

    if ($scope.editMode) {
      return;
    }

    if (newVal !== undefined) {
      editorService.setTags(newVal);
    }
  });

  const clearTitleValidation = () => {
    const eTitle = document.querySelector('#content-title');
    if (eTitle) {
      eTitle.classList.remove('error');
    }
  };

  const clearBodyValidation = () => {
    const eBody = document.querySelector('#reply-editor-1 textarea');
    if (eBody) {
      eBody.classList.remove('error');
    }
  };

  const clearTagsValidation = () => {
    const eTags = document.querySelector('#content-tags');
    if (eTags) {
      eTags.classList.remove('error');
    }
    $scope.tagErr = null;
  };

  const validateTags = (tags) => {
    const tagList = tags.trim().split(' ');

    if (tagList.length > 5) {
      return $filter('__')('EDITOR_MAX_TAGS_ERR');
    }

    if (tagList.find(c => c.length > 24)) {
      return $filter('__')('EDITOR_MAX_TAG_LENGTH_ERR');
    }

    if (tagList.find(c => c.split('-').length > 2)) {
      return $filter('__')('EDITOR_MAX_DASH_ERR');
    }

    if (tagList.find(c => c.indexOf(',') >= 0)) {
      return $filter('__')('EDITOR_SEPARATOR_ERR');
    }

    if (tagList.find(c => /[A-Z]/.test(c))) {
      return $filter('__')('EDITOR_LOWERCASE_ERR');
    }

    if (tagList.find(c => !/^[a-z0-9-#]+$/.test(c))) {
      return $filter('__')('EDITOR_CHARS_ERR');
    }

    if (tagList.find(c => !/^[a-z-#]/.test(c))) {
      return $filter('__')('EDITOR_START_CHARS_ERR');
    }

    if (tagList.find(c => !/[a-z0-9]$/.test(c))) {
      return $filter('__')('EDITOR_END_CHARS_ERR');
    }

    return true;
  };

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

    $scope.tagErr = null;
    if (!$scope.tags) {
      eTags.classList.add('error');
      eTags.focus();
      return false;
    } else {
      const r = validateTags($scope.tags);
      if (r !== true) {
        $scope.tagErr = r;
        eTags.classList.add('error');
        eTags.focus();
        return false;
      }
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
      $rootScope.showError('Could not save draft!');
    }).then(() => {
      $scope.saving = false;
      $scope.processing = false;
    });
  };

  $scope.post = () => {
    if (!validate()) {
      return false;
    }

    const title = $scope.title.trim();
    const body = $scope.body.trim();
    const tags = $scope.tags.split(' ');
    const author = activeUsername();
    const parentPermlink = tags[0];
    const permlink = createPermlink(title);
    const meta = extractMetadata(body);
    const jsonMeta = makeJsonMetadata(meta, tags, appVersion);
    const options = makeOptions(activeUsername(), permlink, $scope.operationType);
    const voteWeight = $scope.vote.checked ? (helperService.getVotePerc(activeUsername()) * 100) : null;

    $scope.posting = true;
    $scope.processing = true;

    steemAuthenticatedService.comment('', parentPermlink, author, permlink, title, body, jsonMeta, options, voteWeight).then((resp) => {
      $rootScope.showSuccess($filter('translate')('POST_SUBMITTED'));
      $rootScope.selectedPost = null;
      $location.path(`/post/${parentPermlink}/${author}/${permlink}`);
    }).catch((e) => {
      $rootScope.showError(e);
    }).then(() => {
      $scope.posting = false;
      $scope.processing = false;
    });
  };

  $scope.update = () => {
    if (!validate()) {
      return false;
    }

    let newBody = $scope.body.trim();
    const patch = createPatch(editingContent.body, newBody);
    if (patch && patch.length < new Buffer(editingContent.body, 'utf-8').length) {
      newBody = patch;
    }

    let bExist = false;

    for (let b of editingContent.beneficiaries) {
      if (b && b.account === 'esteemapp') {
        bExist = true;
        break;
      }
    }

    const title = $scope.title.trim();
    const body = newBody;
    const tags = $scope.tags.split(' ');
    const author = editingContent.author;
    const parentPermlink = editingContent.parent_permlink;
    const permlink = editingContent.permlink;
    const meta = extractMetadata($scope.body);
    const jsonMetadata = makeJsonMetadata(meta, tags, appVersion);
    const options = bExist ? null : makeOptions(author, permlink, null);

    $scope.posting = true;
    $scope.processing = true;

    steemAuthenticatedService.comment('', parentPermlink, author, permlink, title, body, jsonMetadata, options, null).then((resp) => {
      $rootScope.showSuccess($filter('__')('POST_UPDATED'));
      $rootScope.$broadcast('CONTENT_UPDATED', {contentId: editingContent.id});
      $rootScope.selectedPost = null;
      $location.path(`/post/${parentPermlink}/${author}/${permlink}`);
    }).catch((e) => {
      $rootScope.showError(e);
    }).then(() => {
      $scope.posting = false;
      $scope.processing = false;
    });
  };

  const getAccount = () => {
    return steemService.getAccounts([activeUsername()]).then((resp) => {
      if (resp.length === 1 && resp[0].name) {
        return resp[0];
      } else {
        throw new Error('User not found');
      }
    });
  };

  const detectPerm = () => {
    $scope.hasPerm = false;
    if (!activeUsername()) {
      return
    }

    $scope.fetchingPermission = true;
    getAccount().then((account) => {
      $scope.hasPerm = hasPermission(account);
    }).catch((e) => {
      $rootScope.showError(e);
    }).then(() => {
      $scope.fetchingPermission = false;
    });
  };

  detectPerm();

  $scope.grantPermission = () => {
    $scope.fetchingPermission = true;
    getAccount().then((account) => {
      if (hasPermission(account)) {
        $scope.hasPerm = true;
        return;
      }

      $scope.processing = true;
      $scope.updating = true;

      steemAuthenticatedService.grantPostingPermission(account).then((resp) => {
        $rootScope.showSuccess('Posting permission granted');
        detectPerm();
      }).catch((e) => {
        $rootScope.showError(e);
      }).then(() => {
        $scope.processing = false;
        $scope.updating = false;
      });
    }).catch((e) => {
      $rootScope.showError(e);
    }).then(() => {
      $scope.fetchingPermission = false;
    });
  };

  $scope.removePermission = () => {
    getAccount().then((account) => {
      if (!hasPermission(account)) {
        $scope.hasPerm = false;
        return;
      }

      $scope.processing = true;
      $scope.updating = true;

      steemAuthenticatedService.revokePostingPermission(account).then(() => {
        $rootScope.showSuccess('Posting permission removed');
        detectPerm();
      }).catch((e) => {
        $rootScope.showError(e);
      }).then(() => {
        $scope.processing = false;
        $scope.updating = false;
      });
    });
  };

  $scope.scheduleClicked = () => {
    if (!validate()) {
      return false;
    }

    $uibModal.open({
      template: `<div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="{{ 'CANCEL' | translate }}" ng-click="close()">
                      <span aria-hidden="true">&times;</span>
                    </button>
                    <h4 class="modal-title">{{ 'SCHEDULE' | translate }} </h4>
                 </div>
                 <div class="modal-body">
                    <input type="datetime-local" class="form-control" ng-model="dt" required>                  
                 </div>
                  <div class="modal-footer">
                    <button class="btn btn-primary" ng-click="send()" ng-disabled="sending"><i class="fa fa-spin fa-spinner fa-circle-o-notch" ng-if="sending"></i>  {{ 'SCHEDULE' | translate }}</button>
                </div>
              `,
      controller: scheduleModalController,
      windowClass: 'editor-schedule-modal',
      resolve: {
        title: () => {
          return $scope.title;
        },
        body: () => {
          return $scope.body;
        },
        tags: () => {
          return $scope.tags.split(' ');
        },
        operationType: () => {
          return $scope.operationType;
        },
        vote: () => {
          return $scope.vote.checked;
        }
      }
    }).result.then((data) => {
      // Success
    }, () => {
      // Cancel
    });
  };

  $rootScope.$on('userLoggedOut', () => {
    $scope.hasPerm = false;
  });

  $scope.clearForm = () => {
    if ($window.confirm($filter('translate')('ARE_YOU_SURE'))) {
      $scope.title = '';
      $scope.body = $scope.tempBody = '';
      $scope.tags = '';
      $scope.operationType = 'default';
      $scope.vote.checked = false;

      document.querySelector('#vote-checkbox').checked = false;
      document.querySelector('#reward-select').value = 'default';
    }
  }
};


const scheduleModalController = ($scope, $rootScope, $filter, $location, $uibModalInstance, eSteemService, activeUsername, appVersion, title, body, tags, operationType, vote) => {

  moment.locale($rootScope.language);

  $scope.dt = moment().add(1, 'hour').startOf('hour').seconds(0).milliseconds(0).toDate();

  $scope.sending = false;

  $scope.send = () => {
    $scope.sending = true;

    const scheduleDate = new Date($scope.dt).toISOString();
    const permlink = createPermlink(title);
    const meta = extractMetadata(body);
    const jsonMetadata = makeJsonMetadata(meta, tags, appVersion);

    eSteemService.schedule(activeUsername(), title, permlink, jsonMetadata, tags, body, operationType, vote, scheduleDate).then((resp) => {
      if (resp.data.errors) {
        $rootScope.showError(resp.data.errors);
      } else {
        $rootScope.showSuccess($filter('__')('SCHEDULE_SUBMITTED'));
        $scope.close();
        $location.path('/schedules');
      }
    }).catch((e) => {
      $rootScope.showError('Could not create schedule record!');
    }).then(() => {
      $scope.sending = false;
    });

  };

  $scope.close = () => {
    $uibModalInstance.dismiss('cancel');
  };
};
