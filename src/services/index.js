export const discussionsService = ($steem) => {
  return {
    getDiscussionsBy: (what, tag, limit = 10) => {
      return new Promise(function (resolve, reject) {
        let fn = `getDiscussionsBy${what}`;
        return $steem.api[fn]({limit: limit, tag: tag}, function (err, response) {
          if (err) {
            reject(err);
          } else {
            resolve(response);
          }
        })
      });
    }
  }
};

export const tagsService = ($steem) => {
  return {
    getTrendingTags: (limit = 50) => {
      return new Promise(function (resolve, reject) {
        $steem.api.getTrendingTags(null, limit, function (err, response) {
          if (err) {
            reject(err);
          } else {
            resolve(response);
          }
        })
      });
    }
  }
};
