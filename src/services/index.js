export const discussionsService = (steemApi) => {
  return {
    getDiscussionsBy: (what, tag, startAuthor, startPermalink, limit = 20) => {
      return new Promise((resolve, reject) => {
        let fn = `getDiscussionsBy${what}`;
        let params = {tag: tag, start_author: startAuthor, start_permlink: startPermalink, limit: limit};
        return steemApi[fn](params, (err, response) => {
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

export const tagsService = (steemApi) => {
  return {
    getTrendingTags: (limit = 50) => {
      return new Promise((resolve, reject) => {
        steemApi.getTrendingTags(null, limit, (err, response) => {
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
