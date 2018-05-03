import {amountFormatCheck, formatStrAmount} from './helper';

export default ($scope, $rootScope, $filter, $uibModal, userService, steemService, steemAuthenticatedService, activeUsername) => {
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
  $scope.isPoweringDown = false;

  $scope.asset = 'SP';
  $scope.amount = '0.001';
  $scope.balance = '0';
  $scope.routes = [];

  $scope.keyRequiredErr = false;
  $scope.toErr = null;
  $scope.amountErr = null;

  $scope.amountSlider = {
    value: 0.001,
    options: {
      floor: 0,
      ceil: 0,
      step: 0.001,
      precision: 3,
      onChange: function(id, v) {
        //$scope.amount = v;
      }
    }
  };

  $scope.fromChanged = () => {
    $scope.keyRequiredErr = false;
    const a = getAccount($scope.from);
    if (a.type === 's' && !a.keys.active) {
      $scope.keyRequiredErr = true;
    }
    loadFromAccount();
    loadWithdrawRoutes();
  };

  $scope.amountChanged = () => {
    $scope.amountErr = null;

    console.log($scope.amount)

    $scope.amountSlider.value = $scope.amount;


    if (!amountFormatCheck($scope.amount)) {
      $scope.amountErr = $filter('__')('WRONG_AMOUNT_VALUE');
      return;
    }

    const dotParts = $scope.amount.toString().split('.');
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

  $scope.deleteWithDrawAccount = (a) => {
    $scope.deletingWithDrawAccount = true;
    steemAuthenticatedService.setWithdrawVestingRoute(a, 0, false).then((resp) => {
      loadWithdrawRoutes();
    }).catch((e) => {
      $rootScope.showError(e);
    }).then((resp) => {
      $scope.deletingWithDrawAccount = false;
    });
  };

  $scope.addWithDrawAccountClicked = () => {
    $uibModal.open({
      templateUrl: `templates/add-withdraw-account.html`,
      controller: 'addWithDrawAccountCtrl',
      windowClass: 'withdraw-account-modal',
      resolve: {
        afterSuccess: () => {
          return () => {
            loadWithdrawRoutes();
          }
        }
      }
    }).result.then((data) => {
      // Success
    }, () => {
      // Cancel
    });
  };

  $scope.canSubmit = () => {
    return !$scope.fetchingFromAccount && !$scope.fetchingWithdrawRoutes;
  };

  const loadFromAccount = () => {
    $scope.fetchingFromAccount = true;

    return steemService.getAccounts([$scope.from]).then((resp) => {
      const account = resp[0];

      $scope.fetchingFromAccount = false;
      $scope.account = account;
      $scope.balance = getBalance();
      $scope.amountSlider.options.ceil = $scope.balance;
      $scope.amountChanged();

      $scope.isPoweringDown = (account.next_vesting_withdrawal !== '1969-12-31T23:59:59')
    }).catch((e) => {
      $rootScope.showError(e);
    })
  };

  const loadWithdrawRoutes = () => {
    $scope.fetchingWithdrawRoutes = true;
    return steemService.getWithdrawRoutes($scope.from).then((resp) => {
      resp.sort((a, b) => {
        return a.percent - b.percent
      });
      $scope.withdrawRoutes = resp;
    }).catch((e) => {
      $rootScope.showError(e);
    }).then(() => {
      $scope.fetchingWithdrawRoutes = false;
    });
  };

  const getBalance = () => {
    const vests = $scope.account['vesting_shares'].split(' ')[0];
    return $filter('steemPower')(vests);
  };

  const main = async () => {
    $scope.loading = true;
    $scope.$applyAsync();
    await loadFromAccount();
    await loadWithdrawRoutes();
    $scope.loading = false;
    $scope.$applyAsync();
  };

  main();
}
