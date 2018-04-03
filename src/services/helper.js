export const helperService = (storageService) => {
  return {
    isPostRead: (author, permlink) => {
      return storageService.get(`post-${author}-${permlink}-flag`) === 1;
    },
    setPostRead: (author, permlink) => {
      storageService.set(`post-${author}-${permlink}-flag`, 1);
    },
    getVotePerc: (username) => {
      return storageService.get(`vote-perc-${username}`) || 100;
    },
    setVotePerc: (username, val) => {
      storageService.set(`vote-perc-${username}`, val);
    }
  }
};

