
export const amountFormatCheck = (v) => {
  return /^\d+(\.\d+)?$/.test(v);
};

export const formatStrAmount = (strAmount, asset) => {
  return `${parseFloat(strAmount).toFixed(3)} ${asset}`;
};

export const transferCtrl = ($scope, $rootScope, $filter, $uibModalInstance, steemService, steemAuthenticatedService, userService, activeUsername, initialAsset, afterTransfer) => {

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
  $scope.keyRequired = false;
  $scope.balance = '0';

  $scope.toErr = null;
  $scope.amountErr = null;

  $scope.fromChanged = () => {
    $scope.keyRequired = false;
    const a = getAccount($scope.from);
    if (a.type === 's' && !a.keys.active) {
      $scope.keyRequired = true;
    }
    loadAccount();
  };

  $scope.toChanged = () => {
    $scope.toErr = null;
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

  const loadAccount = () => {
    $scope.fetching = true;

    steemService.getAccounts([$scope.from]).then((resp) => {
      return resp[0];
    }).catch((e) => {
      $scope.close();
      $rootScope.showError(e);
    }).then((resp) => {
      $scope.fetching = false;
      $scope.account = resp;
      $scope.balance = getBalance($scope.asset);
      $scope.amountChanged();
    });
  };

  const getBalance = (asset) => {
    const k = (asset === 'STEEM' ? 'balance' : 'sbd_balance');
    return $scope.account[k].split(' ')[0];
  };

  loadAccount();

  $scope.canSend = () => {
    return $scope.to && !$scope.toErr && !$scope.amountErr && !$scope.fetching;
  };

  $scope.send = async () => {

    const from = $scope.from;
    const to = $scope.to.trim();
    const amount = formatStrAmount($scope.amount, $scope.asset);
    const memo = $scope.memo.trim();

    $scope.processing = true;

    const toAccount = await steemService.getAccounts([to]).then((resp) => {
      return resp[0];
    }).catch((e) => {
      $rootScope.showError(e);
    });

    if (!toAccount) {
      $scope.toErr = $filter('translate')('NONEXIST_USER');
      $scope.processing = false;
      $scope.$applyAsync();
      return;
    }

    const fromAccount = getAccount(from);
    const wif = fromAccount.type === 's' ? fromAccount.keys.active : null;

    steemAuthenticatedService.transfer(wif, from, to, amount, memo).then((resp) => {
      afterTransfer();
      $scope.close();
      $rootScope.showSuccess($filter('translate')('TX_BROADCASTED'));
    }).catch((e) => {
      $rootScope.showError(e);
    }).then((resp) => {
      $scope.processing = false;
    });
  };

  $scope.close = () => {
    $uibModalInstance.dismiss('cancel');
  };
};
