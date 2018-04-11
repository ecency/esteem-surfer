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
    addDraft: function (user, title, body, tags, post_type) {
      return $http.post(`${apiUrl}/api/draft`, {
        username: user,
        title: title,
        body: body,
        tags: tags,
        post_type: post_type
      });
    },
    getDrafts: function (user) {
      return $http.get(`${apiUrl}/api/drafts/${user}`);
    },
    removeDraft: function (id, user) {
      return $http.delete(`${apiUrl}/api/drafts/${user}/${id}`);
    },
    schedule: function (user, title, permlink, json, tags, body, operationType, upvote, scheduleDate) {
      return $http.post(`${apiUrl}/api/schedules`, {
        username: user,
        category: tags[0],
        title: title,
        permlink: permlink,
        json: JSON.stringify(json),
        tags: tags,
        body: body,
        post_type: operationType,
        upvote_this: upvote,
        schedule: scheduleDate,
        chain: 'steem'
      });
    },
    getSchedules: function (user) {
      return $http.get(`${apiUrl}/api/schedules/${user}`);
    },
    removeSchedule: function (id, user) {
      return $http.delete(`${apiUrl}/api/schedules/${user}/${id}`);
    },
    moveSchedule: function (id, user) {
      return $http.put(`${apiUrl}/api/schedules/${user}/${id}`);
    },
    search: function (q, page = 1) {
      return $http.get(`https://api.asksteem.com/search?q=${q}&include=meta,body&pg=${page}&sort_by=created&order=desc`);
    },

  }
}
