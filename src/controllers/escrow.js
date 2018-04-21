import moment from 'moment';


export const amountFormatCheck = (v) => {
  return /^\d+(\.\d+)?$/.test(v);
};

export const formatStrAmount = (strAmount, asset) => {
  return `${parseFloat(strAmount).toFixed(3)} ${asset}`;
};


export default ($scope, $rootScope, $filter, $uibModalInstance, steemService, userService, steemAuthenticatedService, activeUsername, initialAsset, afterTransfer) => {

  $scope.lookupAccounts = (val) => {
    return steemService.lookupAccounts(val, 5).then((resp) => {
      return resp;
    });
  };

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
  $scope.agent = '';
  $scope.amount = '0.001';
  $scope.asset = initialAsset;
  $scope.memo = '';
  $scope.deadline = moment().add(1, 'hour').startOf('hour').seconds(0).milliseconds(0).toDate();
  $scope.expiration = moment().add(2, 'hour').startOf('hour').seconds(0).milliseconds(0).toDate();

  $scope.keyRequired = false;
  $scope.balance = '0';

  $scope.toData = null;
  $scope.agentData = null;

  $scope.toErr = null;
  $scope.agentErr = null;
  $scope.amountErr = null;

  $scope.fromChanged = () => {
    $scope.keyRequired = false;
    const a = getAccount($scope.from);
    if (a.type === 's' && !a.keys.active) {
      $scope.keyRequired = true;
    }
    loadFromAccount();
  };

  $scope.toChanged = () => {
    $scope.toErr = null;
  };

  $scope.toLeaved = () => {
    // Empty
    if (!$scope.to) {
      $scope.toData = null;
      return false;
    }

    // Not empty but did not changed
    if ($scope.toData && $scope.toData.name === $scope.to) {
      return;
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
  };

  $scope.agentChanged = () => {
    $scope.agentErr = null;
  };

  $scope.agentLeaved = () => {
    // Empty
    if (!$scope.agent) {
      $scope.agentData = null;
      return false;
    }

    // Not empty but did not changed
    if ($scope.agentData && $scope.agentData.name === $scope.agent) {
      return;
    }

    $scope.agentData = null;
    $scope.fetchingAgent = true;

    steemService.getAccounts([$scope.agent]).then((resp) => {
      if (resp.length === 0) {
        $scope.agentErr = $filter('translate')('NONEXIST_USER');
        return;
      }

      $scope.agentData = resp[0];
      let jm = {};
      try {
        jm = JSON.parse($scope.agentData.json_metadata);
      } catch (e) { }

      $scope.agentData.escrowInfo = (jm.escrow || {terms: "-", fees: {'STEEM': 0.001, 'SBD': 0.001}});

    }).catch((e) => {
      $rootScope.showError(e);
    }).then((resp) => {
      $scope.fetchingAgent = false;
    });
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
    const k = (asset === 'STEEM' ? 'balance' : 'sbd_balance');
    return $scope.account[k].split(' ')[0];
  };

  loadFromAccount();

  $scope.canSubmit = () => {
    return $scope.toData && $scope.agentData && $scope.deadline && $scope.expiration && !$scope.fetchingTo && !$scope.fetchingAgent && !$scope.fetchingFromAccount && !$scope.amountErr;
  };

  $scope.submit = () => {

    const from = $scope.from;
    const to = $scope.to.trim();
    const agent = $scope.agent.trim();
    const escrowId = (new Date().getTime()) >>> 0;
    const sbd = $scope.asset === 'SBD' ? formatStrAmount($scope.amount, 'SBD') : '0.000 SBD';
    const steem = $scope.asset === 'STEEM' ? formatStrAmount($scope.amount, 'STEEM') : '0.000 STEEM';
    const fee = `${$scope.agentData.escrowInfo.fees[$scope.asset]} ${$scope.asset}`;
    const deadlineDate = $scope.deadline;
    const expirationDate = $scope.expiration;
    const jsonMeta = {
      terms: $scope.agentData.escrowInfo.terms,
      memo: `${$scope.memo} ${escrowId}`
    };

    const fromAccount = getAccount(from);
    const wif = fromAccount.type === 's' ? fromAccount.keys.active : null;

    $scope.processing = true;
    steemAuthenticatedService.escrowTransfer(wif, from, to, agent, escrowId, sbd, steem, fee, deadlineDate, expirationDate, JSON.stringify(jsonMeta)).then((resp) => {
      console.log(resp);

      const m = `${$filter('translate')('TX_BROADCASTED')} ${$filter('translate')('ESCROW')} ${$filter('translate')('ID')} : ${escrowId}`;
      $rootScope.showSuccess(m);
      afterTransfer();
      $scope.close();
    }).catch((e) => {
      $rootScope.showError(e);
    }).then((resp) => {
      $scope.processing = false;
    });

    /*
    console.log(`escrowId: ${escrowId}`);
    console.log(`amount: ${amount}`);
    console.log(`sbd: ${sbd}`);
    console.log(`steem: ${steem}`);
    console.log(`fee: ${fee}`);
    console.log(`deadlineDate: ${deadlineDate}`);
    console.log(`expirationDate: ${expirationDate}`);
    console.log(`jm: ${JSON.stringify(jm)}`);
    */
  };

  $scope.close = () => {
    $uibModalInstance.dismiss('cancel');
  };
};
