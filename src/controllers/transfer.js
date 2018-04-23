import {amountFormatCheck, formatStrAmount} from './helper';

export const transferCtrl = ($scope, $rootScope, $timeout, $filter, $uibModalInstance, autoCancelTimeout, steemService, steemAuthenticatedService, userService, activeUsername, initialAsset, mode, afterTransfer) => {


  $scope.mode = mode;

  const accountList = userService.getAll();

  const getAccount = (a) => {
    for (let i of accountList) {
      if (i.username === a) {
        return i;
      }
    }
  };

  $scope.accountList = accountList.map(x => x.username);
  $scope.account = null;
  $scope.from = activeUsername();

  $scope.to = '';
  $scope.amount = '0.001';
  $scope.asset = initialAsset;
  $scope.memo = '';
  $scope.balance = '0';
  $scope.toData = null;

  $scope.keyRequiredErr = false;
  $scope.toErr = null;
  $scope.amountErr = null;

  $scope.fromChanged = () => {
    $scope.keyRequiredErr = false;
    const a = getAccount($scope.from);
    if (a.type === 's' && !a.keys.active) {
      $scope.keyRequiredErr = true;
    }
    loadFromAccount();
  };

  $scope.toChanged = () => {
    $scope.toErr = null;
    $scope.toData = null;

    autoCancelTimeout(() => {
      if (!$scope.to) {
        return false;
      }

      $scope.toData = null;
      $scope.fetchingTo = true;

      steemService.getAccounts([$scope.to]).then((resp) => {
        if (resp.length === 0) {
          $scope.toErr = $filter('translate')('NONEXIST_USER');
          return;
        }

        $scope.toData = resp[0];
      }).catch((e) => {
        $rootScope.showError(e);
      }).then((resp) => {
        $scope.fetchingTo = false;
      });
    }, 700);
  };

  $scope.amountChanged = () => {
    $scope.amountErr = null;

    if (!amountFormatCheck($scope.amount)) {
      $scope.amountErr = $filter('__')('WRONG_AMOUNT_VALUE');
      return;
    }

    const dotParts = $scope.amount.split('.');
    if (dotParts.length > 1) {
      const precision = dotParts[1];
      if (precision.length > 3) {
        $scope.amountErr = $filter('__')('AMOUNT_PRECISION_ERR');
        return;
      }
    }

    if (parseFloat($scope.amount) > parseFloat($scope.balance)) {
      $scope.amountErr = $filter('__')('INSUFFICIENT_FUNDS');
      return;
    }
  };

  $scope.assetChanged = (a) => {
    $scope.asset = a;
    $scope.balance = getBalance(a);
    $scope.amountChanged();
  };

  $scope.copyBalance = () => {
    $scope.amount = $scope.balance;
    $scope.amountChanged();
  };

  const loadFromAccount = () => {
    $scope.fetchingFromAccount = true;

    steemService.getAccounts([$scope.from]).then((resp) => {
      return resp[0];
    }).catch((e) => {
      $scope.close();
      $rootScope.showError(e);
    }).then((resp) => {
      $scope.fetchingFromAccount = false;
      $scope.account = resp;
      $scope.balance = getBalance($scope.asset);
      $scope.amountChanged();
    });
  };

  const getBalance = (asset) => {

    if (mode === 'from_savings') {
      const k = (asset === 'STEEM' ? 'savings_balance' : 'savings_sbd_balance');
      return $scope.account[k].split(' ')[0];
    }

    const k = (asset === 'STEEM' ? 'balance' : 'sbd_balance');
    return $scope.account[k].split(' ')[0];
  };

  loadFromAccount();

  $scope.canSubmit = () => {
    return $scope.toData &&
      !$scope.amountErr &&
      !$scope.keyRequiredErr &&
      !$scope.fetchingTo &&
      !$scope.fetchingFromAccount;
  };

  $scope.submit = () => {

    const from = $scope.from;
    const to = $scope.to.trim();
    const amount = formatStrAmount($scope.amount, $scope.asset);
    const memo = $scope.memo.trim();

    const fromAccount = getAccount(from);
    const wif = fromAccount.type === 's' ? fromAccount.keys.active : null;

    $scope.processing = true;
    let prms = '';
    switch (mode) {
      case 'normal':
        prms = steemAuthenticatedService.transfer(wif, from, to, amount, memo);
        break;
      case 'to_savings':
        prms = steemAuthenticatedService.transferToSavings(wif, from, to, amount, memo);
        break;
      case 'from_savings':
        const requestId = (new Date().getTime()) >>> 0;
        prms = steemAuthenticatedService.transferFromSavings(wif, from, requestId, to, amount, memo);
        break;
    }

    prms.then((resp) => {
      afterTransfer();
      $scope.close();
      $rootScope.showSuccess($filter('translate')('TX_BROADCASTED'));
    }).catch((e) => {
      $rootScope.showError(e);
    }).then((resp) => {
      $scope.processing = false;
    });
  };

  $timeout(() => {
    if (mode === 'normal') {
      document.getElementById('transfer-to').focus();
    } else {
      $scope.to = activeUsername();
      $scope.toChanged();

      document.getElementById('transfer-amount').focus();
    }

  }, 500);


  $scope.close = () => {
    $uibModalInstance.dismiss('cancel');
  };
};
