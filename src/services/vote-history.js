export default ($rootScope) => {
  return {
    set: (username, contentId, val) => {
      if ($rootScope.voteHist === undefined) {
        $rootScope.voteHist = {};
      }
      const key = `vote_hist_${username}_${contentId}`;
      $rootScope.voteHist[key] = val;
    },
    get: (username, contentId) => {
      if ($rootScope.voteHist === undefined) {
        return null;
      }
      const key = `vote_hist_${username}_${contentId}`;
      return $rootScope.voteHist[key] || null;
    },
    remove: (username, contentId) => {
      if ($rootScope.voteHist === undefined) {
        return null;
      }
      const key = `vote_hist_${username}_${contentId}`;
      delete $rootScope.voteHist[key];
    }
  }
};
