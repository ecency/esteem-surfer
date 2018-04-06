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

  const vote = (wif, voter, author, permlink, weight) => {
    let defer = $q.defer();

    steem.broadcast.vote(wif, voter, author, permlink, weight, function (err, response) {
      if (err) {
        defer.reject(err);
      } else {
        defer.resolve(response);
      }
    });

    return defer.promise;
  };

  const voteSC = (token, voter, author, permlink, weight) => {

    let defer = $q.defer();

    const api = sc2.Initialize({
      accessToken: token
    });

    api.vote(voter, author, permlink, weight, function (err, res) {
      if (err) {
        defer.reject(err);
      } else {
        defer.resolve(res);
      }
    });

    return defer.promise;

  };

  const comment = (wif, parentAuthor, parentPermlink, author, permlink, body, jsonMetadata, options) => {
    let defer = $q.defer();

    const opArray = [
      ['comment', {
        parent_author: parentAuthor,
        parent_permlink: parentPermlink,
        author: author,
        permlink: permlink,
        title: '',
        body: body,
        json_metadata: JSON.stringify(jsonMetadata)
      }]
    ];

    if (options) {
      const e = ['comment_options', options];
      opArray.push(e);
    }

    steem.broadcast.send({operations: opArray, extensions: []}, {posting: wif}, function (err, response) {
      if (err) {
        defer.reject(err);
      } else {
        defer.resolve(response);
      }
    });

    return defer.promise;
  };

  const commentSc = (token, parentAuthor, parentPermlink, author, permlink, body, jsonMetadata, options) => {

    let defer = $q.defer();

    const api = sc2.Initialize({
      accessToken: token
    });

    const params = {
      parent_author: parentAuthor,
      parent_permlink: parentPermlink,
      author: author,
      permlink: permlink,
      title: '',
      body: body,
      json_metadata: JSON.stringify(jsonMetadata)
    };

    api.broadcast([['comment', params], ['comment_options', options]], function (err, response) {
      if (err) {
        defer.reject(err);
      } else {
        defer.resolve(response);
      }
    });

    return defer.promise;
  };

  const deleteComment = (wif, author, permlink) => {
    let defer = $q.defer();

    steem.broadcast.deleteComment(wif, author, permlink, function (err, response) {
      if (err) {
        defer.reject(err);
      } else {
        defer.resolve(response);
      }
    });

    return defer.promise;
  };

  const deleteCommentSc = (token, author, permlink) => {

    let defer = $q.defer();

    defer.reject('Steem connect delete_comment not implemented yet');

    /*
    It will probably work like this:

    const api = sc2.Initialize({
      accessToken: token
    });

    const params = {
      author: author,
      permlink: permlink
    };

    api.broadcast([['delete_comment', params]], function (err, response) {
      if (err) {
        defer.reject(err);
      } else {
        defer.resolve(response);
      }
    });
    */

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
    },
    vote: (author, permlink, weight) => {
      // requires Posting key

      const voter = $rootScope.user.username;
      switch ($rootScope.user.type) {
        case 's':
          const wif = getProperWif(['posting']);
          return vote(wif, voter, author, permlink, weight);
          break;
        case 'sc':
          const token = getAccessToken();
          return voteSC(token, voter, author, permlink, weight);
          break;
      }
    },
    comment: (parentAuthor, parentPermlink, author, permlink, body, jsonMetadata, options) => {
      // requires Posting key
      switch ($rootScope.user.type) {
        case 's':
          const wif = getProperWif(['posting']);
          return comment(wif, parentAuthor, parentPermlink, author, permlink, body, jsonMetadata, options);
          break;
        case 'sc':
          const token = getAccessToken();
          return commentSc(token, parentAuthor, parentPermlink, author, permlink, body, jsonMetadata, options);
          break;
      }
    },
    deleteComment: (author, permlink) => {
      switch ($rootScope.user.type) {
        case 's':
          const wif = getProperWif(['posting']);
          return deleteComment(wif, author, permlink);
          break;
        case 'sc':
          const token = getAccessToken();
          return deleteCommentSc(token, author, permlink);
          break;
      }
    }
  }
};
