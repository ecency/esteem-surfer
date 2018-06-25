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
    },
    getWelcomeFlag: () => {
      return storageService.get(`welcome-flag`);
    },
    setWelcomeFlag: (val) => {
      storageService.set(`welcome-flag`, val);
    },
    setPostReblogged: (account, author, permlink) => {
      storageService.set(`${account}-${author}-${permlink}-reblogged`, 1);
    },
    isPostReblogged: (account, author, permlink) => {
      return storageService.get(`${account}-${author}-${permlink}-reblogged`) === 1;
    },
    isReleasePostRead: (ver) => {
      return storageService.get(`release-post-${ver}`);
    },
    setReleasePostRead: (ver) => {
      storageService.set(`release-post-${ver}`, 1);
    }
  }
};

