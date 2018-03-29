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
  }
}
