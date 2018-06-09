import steem from 'steem';

export default ($rootScope, cryptoService) => {
  const commentBodyFilter = (comment) => {

    // Encrypted comments starts with #
    if (!comment.body.startsWith('#')) {
      return comment.body;
    }

    const activeUser = $rootScope.user.username;
    if (!activeUser) {
      return comment.body;
    }

    // Parse json meta to check if its encrypted
    let jsonMeta = {};
    try {
      jsonMeta = JSON.parse(comment.json_metadata);
    } catch (e) {
    }

    if (jsonMeta.encrypted !== 1) {
      return comment.body;
    }

    // Only comment's owner and parent comment/post's owner can see
    if (![comment.author, comment.parent_author].includes(activeUser)) {
      return '*encrypted comment*'
    }

    // Requires traditional steem login
    if ($rootScope.user.type === 'sc') {
      return '*encrypted comment. use traditional login to see comment.*'
    }

    // Get user private memo key
    let privateMemoKey = null;
    try {
      privateMemoKey = cryptoService.decryptKey($rootScope.user.keys['memo']);
    } catch (e) {
      return '*encrypted comment*'
    }

    // Decode
    try {
      const d = steem.memo.decode(privateMemoKey, comment.body);
      return d.replace('#', '');
    } catch (e) {
      return '*encrypted comment*'
    }
  };

  commentBodyFilter.$stateful = true;
  return commentBodyFilter;
};


