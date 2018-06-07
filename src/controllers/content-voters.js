import {authorReputation} from '../filters/author-reputation';

export default ($scope, $rootScope, $uibModalInstance, $location, content, steemService) => {

  const totalPayout =
    parseFloat(content.pending_payout_value.split(' ')[0]) +
    parseFloat(content.total_payout_value.split(' ')[0]) +
    parseFloat(content.curator_payout_value.split(' ')[0]);


  const voteRshares = content.active_votes.reduce((a, b) => a + parseFloat(b.rshares), 0);
  const ratio = totalPayout / voteRshares;
  const rate = $rootScope.currencyRate;

  $scope.sort = 'reward';
  $scope.dir = 'desc';

  $scope.data = [];

  const sortData = () => {
    $scope.data.sort((a, b) => {

      const keyA = a[$scope.sort],
        keyB = b[$scope.sort];

      if ($scope.dir === 'asc') {
        if (keyA > keyB) return 1;
        if (keyA < keyB) return -1;
      } else if ($scope.dir === 'desc') {
        if (keyA > keyB) return -1;
        if (keyA < keyB) return 1;
      }

      return 0;
    });
  };

  $scope.sortData = (f) => {
    if ($scope.sort === f) {
      $scope.dir = ($scope.dir === 'asc' ? 'desc' : 'asc');
    } else {
      $scope.sort = f;
      $scope.dir = 'desc';
    }
    sortData();
  };

  $scope.loading = true;

  steemService.getActiveVotesAsync(content.author, content.permlink).then((resp) => {
    for (let a of resp) {
      const rew = ((a.rshares * ratio) * rate);
      const rep = authorReputation(a.reputation);

      $scope.data.push(Object.assign({}, {reward: rew, reward_fixed: rew.toFixed(2)}, a, {reputation: rep}));
    }
    $scope.dataLen = resp.length;

    sortData();
  }).catch((e) => {
    $rootScope.showError(e);
  }).then(() => {
    $scope.loading = false;
  });


  $scope.authorClicked = (author) => {
    let u = `/account/${author}`;
    $location.path(u);
    $scope.close();
  };

  $scope.close = () => {
    $uibModalInstance.dismiss('cancel');
  };
}
