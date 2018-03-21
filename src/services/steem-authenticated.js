import steem from 'steem';


export default ($rootScope, steemApi, $q) => {

  const followSteem = (wif, follower, following) => {
    const json = ['follow', {follower: follower, following: following, what: ['blog']}];
    let defer = $q.defer();
    steem.broadcast.customJson(wif, [], [follower], 'follow', JSON.stringify(json), (err, response) => {
      if (err) {
        defer.reject(err);
      } else {
        defer.resolve(response);
      }
    });

    return defer.promise;
  };

  const followSteemConnect = (token, following) => {

  };

  const getProperWif = (r) => {
    for (let i of r) {
      if ($rootScope.user.keys[i]) {
        return $rootScope.user.keys[i];
      }
    }
  };

  return {
    follow: (following) => {
      /*
      let wif = '';
      for(let i in ['active', 'owner']){

      }*/
      // requires Active or Owner key or Master password.

      switch ($rootScope.user.type) {
        case 's':
          const wif = getProperWif(['active', 'owner']);
          return followSteem(wif, $rootScope.user.username, following);
          break;
        case 'sc':
          followSteemConnect(wif, $rootScope.user.username, following);
          break;
      }
    }
  }
};
