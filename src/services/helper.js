export const helperService = (storageService) => {
  return {
    isPostRead: (postId) => {
      return storageService.get(`post-${postId}-flag`) === 1;
    },
    setPostRead: (postId) => {
      storageService.set(`post-${postId}-flag`, 1);
    }
  }
};

