import steem from 'steem';
import sc2 from 'sc2-sdk';

export default ($rootScope, steemApi, $q) => {

  const follow = (wif, follower, following) => {
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

  const followSC = (token, follower, following) => {
    let defer = $q.defer();

    const api = sc2.Initialize({
      accessToken: token
    });

    api.follow(follower, following, function (err, res) {
      if (err) {
        defer.reject(err);
      } else {
        defer.resolve(res);
      }
    });

    return defer.promise;
  };

  const unfollow = (wif, unfollower, unfollowing) => {
    const json = ['follow', {follower: unfollower, following: unfollowing, what: []}];
    let defer = $q.defer();
    steem.broadcast.customJson(wif, [], [unfollower], 'follow', JSON.stringify(json), (err, response) => {
      if (err) {
        defer.reject(err);
      } else {
        defer.resolve(response);
      }
    });

    return defer.promise;
  };

  const unfollowSC = (token, unfollower, unfollowing) => {
    let defer = $q.defer();

    const api = sc2.Initialize({
      accessToken: token
    });

    api.unfollow(unfollower, unfollowing, function (err, res) {
      if (err) {
        defer.reject(err);
      } else {
        defer.resolve(res);
      }
    });

    return defer.promise;
  };

  const ignore = (wif, follower, following) => {
    const json = ['follow', {follower: follower, following: following, what: ['ignore']}];
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

  const ignoreSC = (token, follower, following) => {
    let defer = $q.defer();

    const api = sc2.Initialize({
      accessToken: token
    });

    api.ignore(follower, following, function (err, res) {
      if (err) {
        defer.reject(err);
      } else {
        defer.resolve(res);
      }
    });

    return defer.promise;
  };

  const getProperWif = (r) => {
    for (let i of r) {
      if ($rootScope.user.keys[i]) {
        return $rootScope.user.keys[i];
      }
    }
  };

  const getAccessToken = () => {
    return $rootScope.user.token
  };

  return {
    follow: (following) => {
      // requires Active or Owner key
      const follower = $rootScope.user.username;

      switch ($rootScope.user.type) {
        case 's':
          const wif = getProperWif(['active', 'owner']);
          return follow(wif, follower, following);
          break;
        case 'sc':
          const token = getAccessToken();
          return followSC(token, follower, following);
          break;
      }
    },
    unfollow: (following) => {
      // requires Active or Owner key
      const follower = $rootScope.user.username;

      switch ($rootScope.user.type) {
        case 's':
          const wif = getProperWif(['active', 'owner']);
          return unfollow(wif, follower, following);
          break;
        case 'sc':
          const token = getAccessToken();
          return unfollowSC(token, follower, following);
          break;
      }
    },
    mute: (following) => {
      // requires Active or Owner key
      const follower = $rootScope.user.username;

      switch ($rootScope.user.type) {
        case 's':
          const wif = getProperWif(['active', 'owner']);
          return ignore(wif, follower, following);
          break;
        case 'sc':
          const token = getAccessToken();
          return ignoreSC(token, follower, following);
          break;
      }
    }
  }
};
