import {amountFormatCheck, amountPrecisionCheck, isUrl} from './helper';

export default ($scope, $rootScope, $uibModalInstance, $filter, accountData, steemAuthenticatedService, afterUpdate) => {

  let curJsonMeta = {};

  try {
    curJsonMeta = JSON.parse(accountData.json_metadata);
  } catch (e) {
    $scope.formData = {};
  } finally {
    $scope.formData = curJsonMeta;
  }

  $scope.canSave = () => {
    return true;
  };

  $scope.save = () => {
    const newJsonMeta = Object.assign({}, curJsonMeta, $scope.formData);

    $scope.processing = true;
    steemAuthenticatedService.profileUpdate(accountData.name, accountData.memo_key, newJsonMeta).then((resp) => {
      afterUpdate();
      $rootScope.showSuccess($filter('__')('ACCOUNT_PROFILE_UPDATED'));
      $scope.close();
    }).catch((e) => {
      $rootScope.showError(e);
    }).then(() => {
      $scope.processing = false;
    })
  };

  $scope.profileImageChanged = () => {
    $scope.profileImageErr = null;

    if (!$scope.formData.profile.profile_image) {
      return;
    }

    if (!isUrl($scope.formData.profile.profile_image)) {
      $scope.profileImageErr = 'Invalid URL';
    }
  };

  $scope.coverImageChanged = () => {
    $scope.coverImageErr = null;

    if (!$scope.formData.profile.cover_image) {
      return;
    }

    if (!isUrl($scope.formData.profile.cover_image)) {
      $scope.coverImageErr = 'Invalid URL';
    }
  };

  $scope.websiteChanged = () => {
    $scope.websiteErr = null;

    if (!$scope.formData.profile.website) {
      return;
    }

    if (!isUrl($scope.formData.profile.website)) {
      $scope.websiteErr = 'Invalid URL';
    }
  };

  $scope.feeSteemChanged = () => {
    $scope.escrowSteemErr = null;

    if (!$scope.formData.escrow.fees.STEEM) {
      return;
    }

    if (!amountFormatCheck($scope.formData.escrow.fees.STEEM)) {
      $scope.escrowSteemErr = $filter('__')('WRONG_AMOUNT_VALUE');
    }

    if (!amountPrecisionCheck($scope.formData.escrow.fees.STEEM)) {
      $scope.escrowSteemErr = $filter('__')('AMOUNT_PRECISION_ERR');
    }
  };

  $scope.feeSbdChanged = () => {
    $scope.escrowSbdErr = null;

    if (!$scope.formData.escrow.fees.SBD) {
      return;
    }

    if (!amountFormatCheck($scope.formData.escrow.fees.SBD)) {
      $scope.escrowSbdErr = $filter('__')('WRONG_AMOUNT_VALUE');
    }

    if (!amountPrecisionCheck($scope.formData.escrow.fees.SBD)) {
      $scope.escrowSbdErr = $filter('__')('AMOUNT_PRECISION_ERR');
    }
  };

  $scope.close = () => {
    $uibModalInstance.dismiss('cancel');
  };
}
