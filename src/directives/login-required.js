export default ($rootScope, $uibModal) => {
  return {
    restrict: 'A',
    replace: false,
    scope: {
      onLoginSuccess: '&',
      ifLoggedIn: '&',
      onLoginOpen: '&',
      requiredKeys: '='
    },
    link: (scope, elem, attrs) => {

      const checkLogin = () => {
        let openLogin = false;
        let loginMsg = 'This action requires login';

        if (!$rootScope.user) {
          openLogin = true;
        } else {
          if ($rootScope.user.type === 's' && scope.requiredKeys) {
            let requiredKeys = scope.requiredKeys.split(',');
            let f = false;

            for (let k of requiredKeys) {
              if ($rootScope.user.keys[k]) {
                f = true;
                break;
              }
            }

            if (!f) {
              let km = '';
              for (let k of requiredKeys) {
                km += k.substr(0, 1).toUpperCase() + k.substr(1) + ' key or ';
              }

              loginMsg = `This action requires ${ km } Master password`;
              openLogin = true;
            }
          }
        }

        if (openLogin) {
          openLoginModalWindow(loginMsg);
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
            },
            onOpen: function () {
              return () => {
                if (scope.onLoginOpen) {
                  scope.onLoginOpen();
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
          if (scope.ifLoggedIn) {
            scope.ifLoggedIn();
          }
          scope.$applyAsync();
        }
      });
    }
  };
}
