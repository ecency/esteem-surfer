export default () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {},
    templateUrl: 'templates/directives/transfer-navbar.html',
    controller: ($scope, $rootScope, $location, $uibModal, activeUsername) => {

      const openTransferWindow = (asset, mode, afterTransfer) => {
        $uibModal.open({
          templateUrl: `templates/transfer.html`,
          controller: 'transferCtrl',
          windowClass: 'transfer-modal',
          resolve: {
            initialAsset: () => {
              return asset;
            },
            afterTransfer: () => {
              return afterTransfer;
            },
            mode: () => {
              return mode;
            }
          }
        }).result.then((data) => {
          // Success
        }, () => {
          // Cancel
        });
      };

      $scope.transferClicked = () => {
        $location.path(`/${ activeUsername() }/transfer`);
        return;

        openTransferWindow('STEEM', 'normal', () => {
          loadAccount(true).then(() => {
            loadContents();
          });
        });
      };

      const openEscrowWindow = (asset, afterTransfer) => {
        $uibModal.open({
          templateUrl: `templates/escrow.html`,
          controller: 'escrowCtrl',
          windowClass: 'escrow-modal',
          resolve: {
            initialAsset: () => {
              return asset;
            },
            afterTransfer: () => {
              return afterTransfer
            }
          }
        }).result.then((data) => {
          // Success
        }, () => {
          // Cancel
        });
      };

      $scope.escrowClicked = () => {
        $location.path(`/${ activeUsername() }/escrow`);
        return;

        openEscrowWindow('STEEM', () => {
        });
      };

      $scope.transferToSavingsClicked = () => {
        $location.path(`/${ activeUsername() }/transfer/to_savings`);

        return;
        openTransferWindow('STEEM', 'to_savings', () => {
          loadAccount(true).then(() => {
            loadContents();
          });
        });
      };

      $scope.transferFromSavingsClicked = () => {

        $location.path(`/${ activeUsername() }/transfer/from_savings`);
        return;

        openTransferWindow('STEEM', 'from_savings', () => {
          loadAccount(true).then(() => {
            loadContents();
          });
        });
      };

      const openPowerUpWindow = (afterTransfer) => {
        $uibModal.open({
          templateUrl: `templates/power-up.html`,
          controller: 'powerUpCtrl',
          windowClass: 'power-up-modal',
          resolve: {

            afterTransfer: () => {
              return afterTransfer
            }
          }
        }).result.then((data) => {
          // Success
        }, () => {
          // Cancel
        });
      };

      $scope.powerUpClicked = () => {
        $location.path(`/${ activeUsername() }/power-up`);

        return;
        openPowerUpWindow(() => {
          loadAccount(true).then(() => {
            loadContents();
          });
        });
      };

      $scope.powerDownClicked = () => {
        $location.path(`/${ activeUsername() }/power-down`);
      };
    }
  }
}
