import {postUrlParser} from '../helpers/post-url-parser';

export default ($scope, $rootScope, $location, steemService, steemAuthenticatedService, activeUsername) => {

  $scope.max = 30;
  $scope.remaining = 30;

  $scope.fetching = false;
  $scope.userWitnessList = [];
  $scope.witnesses = [];

  $scope.newProxy = '';
  $scope.proxy = null;

  const calcRemaining = () => {
    $scope.remaining = $scope.max - $scope.userWitnessList.length;
  };

  $scope.$watchCollection('userWitnessList', (oldVal, newVal) => {
    calcRemaining();
  });

  const main = () => {
    $scope.fetching = true;

    steemService.getAccounts([activeUsername()]).then((resp) => {
      $scope.userWitnessList = resp[0].witness_votes;
      $scope.proxy = resp[0].proxy;

      return steemService.getWitnessesByVote(null, 50);
    }).then((resp) => {
      let i = 1;
      for (let row of resp) {
        $scope.witnesses.push(
          Object.assign(
            {},
            {postPath: postUrlParser(row.url)},
            {num: (String(i).length === 1 ? '0' + i : i)},
            row
          )
        );
        i += 1;
      }
    }).catch((e) => {
      $rootScope.showError(e);
    }).then((w) => {
      $scope.fetching = false;
    });
  };

  main();

  $scope.extraVotes = () => {
    const inWitnesses = (w) => {
      for (let o of $scope.witnesses) {
        if (w === o.owner) {
          return true;
        }
      }

      return false;
    };

    return $scope.userWitnessList.filter(r => !inWitnesses(r));
  };

  $scope.vote = (witness) => {
    $scope.userWitnessList.push(witness);
    steemAuthenticatedService.witnessVote(witness, true).then((resp) => {

    }).catch((e) => {
      $scope.userWitnessList = $scope.userWitnessList.filter(e => e !== witness);
      $rootScope.showError(e);
    })
  };

  $scope.unVote = (witness) => {
    $scope.userWitnessList = $scope.userWitnessList.filter(e => e !== witness);
    steemAuthenticatedService.witnessVote(witness, false).then((resp) => {

    }).catch((e) => {
      $scope.userWitnessList.push(witness);
      $rootScope.showError(e);
    });
  };

  $scope.voteExtra = () => {
    const witness = $scope.extra.trim();
    if (!witness) {
      return;
    }

    $scope.vote(witness);
    $scope.extra = '';
  };

  $scope.goThread = (path) => {
    steemService.getContent(path.author, path.permlink).then((resp) => {
      let u = `/post/${resp.parent_permlink}/${resp.author}/${resp.permlink}`;
      $location.path(u);
    });
  };

  $scope.setProxy = () => {
    const newProxy = $scope.newProxy.trim();
    if (!newProxy) {
      return;
    }

    $scope.settingProxy = true;
    steemAuthenticatedService.witnessProxy(newProxy).then((resp) => {
      $scope.proxy = newProxy;
      $scope.newProxy = '';
    }).catch((e) => {
      $rootScope.showError(e);
    }).then(() => {
      $scope.settingProxy = false;
    });

  };

  $scope.clearProxy = () => {
    $scope.clearingProxy = true;
    steemAuthenticatedService.witnessProxy('').then((resp) => {
      $scope.proxy = null;
      console.log(resp)
    }).catch((e) => {
      $rootScope.showError(e);
    }).then(() => {
      $scope.clearingProxy = false;
    });
  };

  $rootScope.$on('userLoggedOut', () => {
    $location.path('/');
  });
};
