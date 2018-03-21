export default ($rootScope, $uibModal) => {
  return {
    restrict: 'A',
    scope: {
      onLoginSuccess: '=',
    },
    link: (scope, elem, attrs) => {

      const checkLogin = () => {
        let openLogin = false;

        if (!$rootScope.user) {
          openLogin = true;
        }

        if (openLogin) {
          openLoginModalWindow('This action requires login');
          return false;
        }

        return true;
      };

      const openLoginModalWindow = (message) => {
        $uibModal.open({
          templateUrl: 'templates/login.html',
          controller: 'loginCtrl',
          windowClass: 'login-modal',
          resolve: {
            loginMessage: function () {
              return message;
            },
            afterLogin: () => {
              return () => {
                if (checkLogin()) {
                  scope.onLoginSuccess();
                }
              }
            }
          }
        }).result.then((data) => {
          // Success
        }, () => {
          // Cancel
        });
      };

      elem.bind('click', function () {
        if (checkLogin()) {
          scope.onLoginSuccess();
          scope.$applyAsync();
        }
      });
    }
  };
}
