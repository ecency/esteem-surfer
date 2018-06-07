import badActors from '../data/bad-actors.json';

export default ($scope, $rootScope, $routeParams, $timeout, $location, $filter, autoCancelTimeout, steemService, steemAuthenticatedService, userService) => {

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

  $scope.amountVest = 0.000;
  $scope.amountVestFormatted = 0.000;
  $scope.amountSp = 0.000;

  $scope.to = '';
  $scope.toData = null;

  $scope.keyRequiredErr = false;
  $scope.toErr = null;

  const checkForKey = () => {
    $scope.keyRequiredErr = false;
    const a = getAccount(curAccount);
    if (a.type === 's' && !a.keys.active) {
      $scope.keyRequiredErr = true;
    }
  };

  checkForKey();

  $scope.amountSlider = {
    value: 0.000,
    options: {
      floor: 0,
      ceil: 0,
      step: 1,
      precision: 6,
      onChange: function (id, v) {
        $scope.amountVest = v;
        $scope.amountVestFormatted = formatVests(v);

        $scope.amountSp = vests2sp(v);
      },
      translate: function (value, sliderId, label) {
        if (label === 'model') {
          if (String(value).indexOf('.') !== -1) {
            return value;
          }
          return value + `.000000 VESTS`;
        }

        return value;
      }
    }
  };

  $scope.fromChanged = () => {
    $location.path(`/${ $scope.from }/delegate`);
  };

  $scope.toChanged = () => {
    $scope.toErr = null;
    $scope.toData = null;

    autoCancelTimeout(() => {
      if (!$scope.to) {
        return false;
      }

      if (badActors.includes($scope.to)) {
        $scope.toErr = $filter('__')('TRANSFER_BAD_ACTOR_ERR');
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

  const availableVestingShares = (account) => {
    if (account.next_vesting_withdrawal !== '1969-12-31T23:59:59') {
      // powering down
      return parseFloat(account.vesting_shares.split(' ')[0]) - (account.to_withdraw - account.withdrawn) / 1e6 - parseFloat(account.delegated_vesting_shares.split(' ')[0]);
    } else {
      // not powering down
      return (parseFloat(account.vesting_shares.split(' ')[0]) - parseFloat(account.delegated_vesting_shares.split(' ')[0])).toFixed(6);
    }
  };

  const loadFromAccount = () => {
    $scope.fetchingFromAccount = true;

    return steemService.getAccounts([$scope.from]).then((resp) => {
      const account = resp[0];

      const vestingShares = availableVestingShares(account);
      $scope.amountSlider.options.ceil = vestingShares;

      const rate = account.vesting_withdraw_rate;
      const vests = parseFloat(rate.split(" ")[0]);
      $scope.withdrawVesting = formatVests(vests);
      $scope.withdrawVesting2sp = vests2sp(vests);

    }).catch((e) => {
      $rootScope.showError(e);
    }).then(() => {
      $scope.fetchingFromAccount = false;
    });
  };

  $scope.canSubmit = () => {
    return $scope.amountVest > 0 &&
      $scope.toData &&
      !$scope.keyRequiredErr &&
      !$scope.fetchingTo &&
      !$scope.fetchingFromAccount;
  };

  $scope.submit = () => {

    const _submit = () => {
      const from = $scope.from;
      const to = $scope.to.trim();
      const vestingShares = `${$scope.amountVest}.000000 VESTS`;

      const fromAccount = getAccount(from);
      const wif = fromAccount.type === 's' ? fromAccount.keys.active : null;

      $scope.processing = true;

      steemAuthenticatedService.delegateVestingShares(wif, from, to, vestingShares).then((resp) => {
        $rootScope.showSuccess($filter('translate')('TX_BROADCASTED'));
        $location.path(`/account/${from}/wallet`);
      }).catch((e) => {
        $rootScope.showError(e);
      }).then((resp) => {
        $scope.processing = false;
      });
    };

    $rootScope.pinDialog(true).result.then((p) => {
      _submit();
    });
  };

  const formatVests = (v) => {
    return $filter('number')(parseFloat(v).toFixed(0)).replace(',', '.');
  };

  const vests2sp = (vests) => {
    return $filter('steemPower')(vests.toString());
  };

  loadFromAccount().then(() => {
    $timeout(() => {
      document.getElementById('transfer-to').focus();
      $scope.$broadcast('rzSliderForceRender');
    }, 200)
  });
};
