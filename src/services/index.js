export const discussionsService = ($steem) => {
  return {
    getDiscussionsBy: (what, limit = 10) => {
      let fn = `getDiscussionsBy${what}Async`;
      return $steem.api[fn]({limit: limit})
    }
  }
};

export const tagsService = ($steem) => {
  return {
    getTrendingTags: () => {
      return $steem.api.getTrendingTags()
    }
  }
};
