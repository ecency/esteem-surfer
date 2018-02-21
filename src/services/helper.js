export const helperService = (storageService) => {
  return {
    genPostUrl: (parent, author, permLink) => {
      return `/post/${parent}/${author}/${permLink}`;
    },
    isPostRead: (postId) => {
      return storageService.get(`post-${postId}-flag`) === 1;
    },
    setPostRead: (postId) => {
      storageService.set(`post-${postId}-flag`, 1);
    }
  }
};

