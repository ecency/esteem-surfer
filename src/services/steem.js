export default (steemApi, $q) => {
  return {
    getDiscussionsBy: (what, tag, startAuthor, startPermalink, limit = 20) => {
      let defer = $q.defer();

      let fn = `getDiscussionsBy${what}`;

      let params = {tag: tag, start_author: startAuthor, start_permlink: startPermalink, limit: limit};

      steemApi.getApi()[fn](params, (err, response) => {
        if (err) {
          defer.reject(err);
        } else {
          defer.resolve(response);
        }
      });

      return defer.promise;
    },
    getTrendingTags: (limit = 50) => {
      let defer = $q.defer();

      steemApi.getApi().getTrendingTags(null, limit, (err, response) => {
        if (err) {
          defer.reject(err);
        } else {
          defer.resolve(response);
        }
      });

      return defer.promise;
    },
    getActiveVotesAsync: (author, permLink) => {
      let defer = $q.defer();

      steemApi.getApi().getActiveVotesAsync(author, permLink, (err, response) => {
        if (err) {
          defer.reject(err);
        } else {
          defer.resolve(response);
        }
      });

      return defer.promise;
    },
    getContent: (author, permLink) => {
      let defer = $q.defer();

      steemApi.getApi().getContent(author, permLink, (err, response) => {
        if (err) {
          defer.reject(err);
        } else {
          defer.resolve(response);
        }
      });
      return defer.promise;
    },
    getState: (path) => {
      let defer = $q.defer();

      steemApi.getApi().getState(path, (err, response) => {
        if (err) {
          defer.reject(err);
        } else {
          defer.resolve(response);
        }
      });
      return defer.promise;
    }
  }
};

