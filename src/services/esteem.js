export default ($http) => {

  // will be hidden
  const apiUrl = 'http://api.esteem.ws:8080';

  return {
    getCurrencyRate: (cur) => {
      return $http.get(`${apiUrl}/api/currencyRate/${ cur.toUpperCase() }/steem`)
    },
    addBookmark: function (username, content) {
      return $http.post(`${apiUrl}/api/bookmark`, {
        username: username,
        author: content.author,
        permlink: content.permlink,
        chain: 'steem'
      });
    },
    getBookmarks: function (user) {
      return $http.get(`${apiUrl}/api/bookmarks/${user}`);
    },
    removeBookmark: function (id, user) {
      return $http.delete(`${apiUrl}/api/bookmarks/${user}/${id}/`);
    },
    uploadImage: function (file, onProgress) {
      const fData = new FormData();
      fData.append('postimage', file);

      return $http({
        url: 'https://img.esteem.ws/backend.php',
        method: 'POST',
        data: fData,
        uploadEventHandlers: {
          progress: function (e) {
            if (onProgress) onProgress(e);
          }
        },
        headers: {
          'Content-Type': undefined
        }
      })
    },
    addMyImage: function (user, url) {
      return $http.post(`${apiUrl}/api/image`, {username: user, image_url: url});
    },
    search: function (q, page = 1) {
      return $http.get(`https://api.asksteem.com/search?q=${q}&include=meta,body&pg=${page}&sort_by=created&order=desc`);
    },
  }
}
