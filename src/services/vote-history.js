export default (storageService) => {
  return {
    set: (username, contentId, val) => {
      storageService.set(`vote_${username}_${contentId}`, val);
    },
    get: (username, contentId) => {
      return storageService.get(`vote_${username}_${contentId}`);
    },
    remove: (username, contentId) => {
      storageService.remove(`vote_${username}_${contentId}`);
    }
  }
};

