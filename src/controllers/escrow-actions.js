export default ($scope, $rootScope, $filter, $routeParams, $timeout, $location, userService, steemService, eSteemService, steemAuthenticatedService) => {

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
  $scope.accountName = curAccount;
  $scope.escrowId = '';
  $scope.escrowData = null;
  $scope.processing = false;

  const checkForKey = () => {
    $scope.keyRequiredErr = false;
    const a = getAccount(curAccount);
    if (a.type === 's' && !a.keys.active) {
      $scope.keyRequiredErr = true;
    }
  };

  checkForKey();

  $scope.fromChanged = () => {
    $location.path(`/${ $scope.accountName }/escrow-actions`);
  };

  $scope.search = () => {
    const id = $scope.escrowId.trim();
    if (!id) {
      document.getElementById('escrow-id').focus();
      return;
    }

    $scope.searching = true;
    $scope.notFound = false;
    $scope.escrowData = null;

    eSteemService.searchEscrow(id).then((resp) => {
      if (resp.data.length === 0) {
        $scope.notFound = true;
        return;
      }

      $scope.escrowData = resp.data[0];

    }).catch((e) => {
      $rootScope.showError(e);
    }).then(() => {
      $scope.searching = false;
    });

  };

  $scope.canSubmit = () => {
    return !$scope.keyRequiredErr;
  };

  $scope.submit = (action, releaseTo = null) => {

    const escrowId = parseInt($scope.escrowId.trim());
    const who = $scope.accountName;
    const whoAccount = getAccount(who);
    const wif = whoAccount.type === 's' ? whoAccount.keys.active : null;

    $scope.processing = true;
    let prms = null;

    switch (action) {
      case 'approve':
        prms = steemAuthenticatedService.escrowApprove(wif, $scope.escrowData.from, $scope.escrowData.to, $scope.escrowData.agent, who, escrowId, true);
        break;
      case 'dispute':
        prms = steemAuthenticatedService.escrowDispute(wif, $scope.escrowData.from, $scope.escrowData.to, $scope.escrowData.agent, who, escrowId);
        break;
      case 'release':
        prms = steemAuthenticatedService.escrowRelease(wif, $scope.escrowData.from, $scope.escrowData.to, $scope.escrowData.agent, who, releaseTo, escrowId, $scope.escrowData.sbd_amount, $scope.escrowData.steem_amount);
        break;
    }

    prms.then((resp) => {
      $rootScope.showSuccess($filter('translate')('TX_BROADCASTED'));

      $scope.escrowId = '';
      $scope.escrowData = null;
    }).catch((e) => {
      $rootScope.showError(e);
    }).then((resp) => {
      $scope.processing = false;
    });
  };

  const loadAccount = () => {
    $scope.fetchingAccount = true;

    return steemService.getAccounts([curAccount]).then((resp) => {
      const account = resp[0];

    }).catch((e) => {
      $rootScope.showError(e);
    }).then(() => {
      $scope.fetchingAccount = false;
    });
  };

  loadAccount().then(() => {
    $timeout(function () {
      document.getElementById('escrow-id').focus();
    }, 200);
  });
}
