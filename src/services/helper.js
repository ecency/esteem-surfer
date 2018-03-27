export const helperService = (storageService) => {
  return {
    isPostRead: (postId) => {
      return storageService.get(`post-${postId}-flag`) === 1;
    },
    setPostRead: (postId) => {
      storageService.set(`post-${postId}-flag`, 1);
    },
    getVotePerc: (username) => {
      return storageService.get(`vote-perc-${username}`) || 100;
    },
    setVotePerc: (username, val) => {
      storageService.set(`vote-perc-${username}`, val);
    }
  }
};

