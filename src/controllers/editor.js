import getSlug from 'speakingurl';
import moment from 'moment';

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


export default ($scope, $rootScope, $routeParams, $filter, $location, $timeout, $uibModal, eSteemService, steemService, activeUsername, steemAuthenticatedService, editorService, helperService, appVersion) => {

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
  $scope.vote = false;

  $scope.saving = false;
  $scope.scheduling = false;
  $scope.posting = false;
  $scope.updating = false;
  $scope.fetchingPermission = false;
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

  $scope.post = () => {
    if (!validate()) {
      return false;
    }

    if ($scope.editMode) {

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

  $rootScope.$on('userLoggedOut', () => {
    $scope.hasPerm = false;
  });

  $scope.grantPermission = () => {
    $scope.fetchingPermission = true;
    getAccount().then((account) => {
      if (hasPermission(account)) {
        $scope.hasPerm = true;
        return;
      }

      $scope.processing = true;
      $scope.updating = true;

      const postingAuth = account.posting;
      postingAuth.account_auths.push(['esteemapp', postingAuth.weight_threshold]);

      steemAuthenticatedService.accountUpdate(activeUsername(), undefined, undefined, postingAuth, account.memo_key, account.json_metadata).then((resp) => {
        $scope.hasPerm = true;
        $rootScope.showSuccess('Posting permission granted');
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

      const postingAuth = account.posting;

      let ind = 0;
      for (let i = 0; i < postingAuth.account_auths.length; i++) {
        if (postingAuth.account_auths[i][0] === 'esteemapp') {
          ind = i;
          break;
        }
      }
      postingAuth.account_auths.splice(ind, 1);

      steemAuthenticatedService.accountUpdate(activeUsername(), undefined, undefined, postingAuth, account.memo_key, account.json_metadata).then((resp) => {
        $scope.hasPerm = false;
        $rootScope.showSuccess('Posting permission removed');
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
                    <div uib-datepicker ng-model="dt" class="well well-sm date-picker" datepicker-options="options" ng-change="dateChanged()"></div>
                    <div class="time-picker">
                          <div uib-timepicker ng-model="dt" hour-step="1" minute-step="1"  show-meridian="false" min="timePickerMin"></div>
                    </div>
                    <div class="selected-date">{{ dateFormatted }} UTC</div>
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
          return $scope.vote;
        }
      }
    }).result.then((data) => {
      // Success
    }, () => {
      // Cancel
    });
  };


  // $scope.openScheduleModal();
};


const scheduleModalController = ($scope, $rootScope, $filter, $location, $uibModalInstance, eSteemService, activeUsername, appVersion, title, body, tags, operationType, vote) => {

  moment.locale($rootScope.language);

  $scope.options = {
    minDate: new Date()
  };

  $scope.dt = new Date();
  $scope.timePickerMin = new Date();

  $scope.dateFormatted = '';

  $scope.$watch('dt', (newVal, oldVal) => {
    const d = moment.utc(newVal);
    $scope.dateFormatted = d.format('DD MMMM YYYY HH:mm');
  });

  $scope.sending = false;

  $scope.send = () => {
    $scope.sending = true;

    const scheduleDate = new Date($scope.dt).toISOString();
    const permlink = createPermlink(title);
    const meta = extractMetadata(body);
    const jsonMetadata = Object.assign({}, meta, {
      tags: tags,
      app: 'esteem-surfer/' + appVersion,
      format: 'markdown+html',
      community: 'esteem'
    });

    eSteemService.schedule(activeUsername(), title, permlink, jsonMetadata, tags, body, operationType, vote, scheduleDate).then((resp) => {
      if (resp.data.errors) {
        $rootScope.showError(resp.data.errors);
      } else {
        $rootScope.showSuccess($filter('__')('SCHEDULE_SUBMITTED'));
        $scope.close();
        $location.path('/schedules');
      }
    }).catch((e) => {
      $rootScope.showError(e);
    }).then(() => {
      $scope.sending = false;
    });


  };

  $scope.close = () => {
    $uibModalInstance.dismiss('cancel');
  };
};
