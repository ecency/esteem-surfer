export default (storageService) => {
  return {
    setTitle: (val) => {
      storageService.set(`editor-title`, val);
    },
    getTitle: () => {
      return storageService.get(`editor-title`);
    },

    setBody: (val) => {
      storageService.set(`editor-body`, val);
    },
    getBody: () => {
      return storageService.get(`editor-body`);
    },

    setTags: (val) => {
      storageService.set(`editor-tags`, val);
    },
    getTags: () => {
      return storageService.get(`editor-tags`);
    },

  }
};

