import userList from '../data/discover.json'


const prepareAccountData = (data) => {
  let name = '';

  if (data.json_metadata !== undefined && data.json_metadata !== '') {
    try {
      let profile = JSON.parse(data.json_metadata).profile;
      name = profile.name;
    } catch (e) {
    }
  }

  return Object.assign({}, data, {full_name: name})
};


export default ($scope, $rootScope, $location, steemService) => {

  $scope.accountList = $rootScope.Data['discoverAccountList'] || [];

  $scope.$watchCollection('accountList', (n, o) => {
    if (n === o) {
      return;
    }

    $rootScope.setNavVar('discoverAccountList', n);
  });

  const loadAccounts = () => {
    $scope.loadingAccounts = true;
    $scope.accountList = [];

    const shuffledList = userList.sort(() => .5 - Math.random());
    const selectedList = shuffledList.slice(0, 40);

    steemService.getAccounts(selectedList).then((accounts) => {
      accounts.forEach(e => $scope.accountList.push(prepareAccountData(e)));
    }).catch((e) => {
      $rootScope.showError(e);
    }).then(() => {
      $scope.loadingAccounts = false;
    });
  };

  if ($scope.accountList.length === 0) {
    loadAccounts();
  }

  $scope.clicked = (user) => {
    let u = `/account/${user.name}`;
    $location.path(u);
  };


  $scope.refresh = () => {
    loadAccounts();
  };
};
