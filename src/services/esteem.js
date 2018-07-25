export default ($http, API_END_POINT) => {

  return {
    getCurrencyRate: (cur) => {
      return $http.get(`${API_END_POINT}/api/currencyRate/${ cur.toUpperCase() }/steem`)
    },
    addBookmark: function (username, content) {
      return $http.post(`${API_END_POINT}/api/bookmark`, {
        username: username,
        author: content.author,
        permlink: content.permlink,
        chain: 'steem'
      });
    },
    getBookmarks: function (user) {
      return $http.get(`${API_END_POINT}/api/bookmarks/${user}`);
    },
    removeBookmark: function (id, user) {
      return $http.delete(`${API_END_POINT}/api/bookmarks/${user}/${id}/`);
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
      return $http.post(`${API_END_POINT}/api/image`, {username: user, image_url: url});
    },
    getImages: function (user) {
      return $http.get(`${API_END_POINT}/api/images/${user}`);
    },
    removeImage: function (id, user) {
      return $http.delete(`${API_END_POINT}/api/images/${user}/${id}`);
    },
    addDraft: function (user, title, body, tags, post_type) {
      return $http.post(`${API_END_POINT}/api/draft`, {
        username: user,
        title: title,
        body: body,
        tags: tags,
        post_type: post_type
      });
    },
    updateDraft: function (user, id, title, body, tags) {
      return $http.put(`${API_END_POINT}/api/drafts/${user}/${id}`, {
        title: title,
        body: body,
        tags: tags
      });
    },
    getDrafts: function (user) {
      return $http.get(`${API_END_POINT}/api/drafts/${user}`);
    },
    removeDraft: function (id, user) {
      return $http.delete(`${API_END_POINT}/api/drafts/${user}/${id}`);
    },
    schedule: function (user, title, permlink, json, tags, body, operationType, upvote, scheduleDate) {
      return $http.post(`${API_END_POINT}/api/schedules`, {
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
      return $http.get(`${API_END_POINT}/api/schedules/${user}`);
    },
    removeSchedule: function (id, user) {
      return $http.delete(`${API_END_POINT}/api/schedules/${user}/${id}`);
    },
    moveSchedule: function (id, user) {
      return $http.put(`${API_END_POINT}/api/schedules/${user}/${id}`);
    },
    search: function (q, page = 1) {
      return $http.get(`https://api.asksteem.com/search?q=${q}&include=meta,body&pg=${page}&sort_by=created&order=desc`);
    },
    searchEscrow: function (id) {
      return $http.get(`${API_END_POINT}/api/escrows/${id}`);
    },
    getWelcome: function () {
      return $http.get(`${API_END_POINT}/media/welcome.json`);
    },
    getMyVotes: function (user, since = null) {
      let u = `${API_END_POINT}/api/rvotes/${user}`;
      if (since) {
        u += `?since=${since}`;
      }
      return $http.get(u);
    },
    getMyReplies: function (user, since = null) {
      let u = `${API_END_POINT}/api/replies/${user}`;
      if (since) {
        u += `?since=${since}`;
      }
      return $http.get(u);
    },
    getMyMentions: function (user, since = null) {
      let u = `${API_END_POINT}/api/mentions/${user}`;
      if (since) {
        u += `?since=${since}`;
      }
      return $http.get(u);
    },
    getMyFollows: function (user, since = null) {
      let u = `${API_END_POINT}/api/follows/${user}`;
      if (since) {
        u += `?since=${since}`;
      }
      return $http.get(u);
    },
    getMyReblogs: function (user, since = null) {
      let u = `${API_END_POINT}/api/reblogs/${user}`;
      if (since) {
        u += `?since=${since}`;
      }
      return $http.get(u);
    },
    getLeaderboard: function () {
      return $http.get(`${API_END_POINT}/api/leaderboard`);
    },
    getFavorites: function (user) {
      return $http.get(`${API_END_POINT}/api/favorites/${user}`);
    },
    addFavorite: function (user, account) {
      return $http.post(`${API_END_POINT}/api/favorite`, {username: user, account: account});
    },
    removeFavoriteUser: function (user, account) {
      return $http.delete(`${API_END_POINT}/api/favoriteUser/${user}/${account}`);
    },
    removeFavorite: function (user, id) {
      return $http.delete(`${API_END_POINT}/api/favorite/${user}/${id}`);
    },
    isFavorite: function (user, account) {
      return $http.get(`${API_END_POINT}/api/isfavorite/${user}/${account}`);
    },
    getActiveVotes: function (user) {
      return $http.get(`${API_END_POINT}/api/votes/${user}`);
    },
    getActivities: function (user, since = null) {
      let u = `${API_END_POINT}/api/activities/${user}`;
      if (since) {
        u += `?since=${since}`;
      }
      return $http.get(u);
    },
    getUnreadActivityCount: function (user) {
      return $http.get(`${API_END_POINT}/api/activities/${user}/unread-count`);
    },
    marActivityAsRead: function (user, id = null) {
      let d = {};
      if (id) {
        d['id'] = id
      }
      return $http.put(`${API_END_POINT}/api/activities/${user}`, d);
    },
    commentHistory: function (author, permlink) {
      return $http.get(`${API_END_POINT}/api/comment-history/${author}/${permlink}`);
    }
  }
}
