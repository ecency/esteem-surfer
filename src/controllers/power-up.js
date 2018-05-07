import {amountFormatCheck, formatStrAmount} from './helper';

export default ($scope, $rootScope, $routeParams, $location, $timeout, $filter, autoCancelTimeout, steemService, steemAuthenticatedService, activeUsername, userService) => {
  const curAccount = $routeParams.account;
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
  $scope.from = curAccount;

  $scope.to = '';
  $scope.amount = '0.001';
  $scope.balance = '0';
  $scope.toData = null;

  $scope.keyRequiredErr = false;
  $scope.toErr = null;
  $scope.amountErr = null;

  const checkForKey = () => {
    $scope.keyRequiredErr = false;
    const a = getAccount(curAccount);
    if (a.type === 's' && !a.keys.active) {
      $scope.keyRequiredErr = true;
    }
  };

  checkForKey();

  $scope.fromChanged = () => {
    $location.path(`/${ $scope.from }/power-up`);
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

  $scope.copyBalance = () => {
    $scope.amount = $scope.balance;
    $scope.amountChanged();
  };

  const loadFromAccount = () => {
    $scope.fetchingFromAccount = true;

    steemService.getAccounts([$scope.from]).then((resp) => {
      return resp[0];
    }).catch((e) => {
      $rootScope.showError(e);
    }).then((resp) => {
      $scope.fetchingFromAccount = false;
      $scope.account = resp;
      $scope.balance = getBalance();
      $scope.amountChanged();
    });
  };

  const getBalance = () => {
    const k = 'balance';
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
    const amount = formatStrAmount($scope.amount, 'STEEM');

    const fromAccount = getAccount(from);
    const wif = fromAccount.type === 's' ? fromAccount.keys.active : null;

    $scope.processing = true;

    steemAuthenticatedService.transferToVesting(wif, from, to, amount).then((resp) => {
      $rootScope.showSuccess($filter('translate')('TX_BROADCASTED'));
      $location.path(`/account/${from}/wallet`);
    }).catch((e) => {
      $rootScope.showError(e);
    }).then((resp) => {
      $scope.processing = false;
    });
  };

  $timeout(() => {
    document.getElementById('transfer-amount').focus();

    $scope.to = activeUsername();
    $scope.toChanged();
  }, 200);
};
