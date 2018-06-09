import steem from 'steem';

export default ($rootScope, cryptoService) => {
  const commentBodyFilter = (comment) => {

    // Encrypted comments starts with #
    if (!comment.body.startsWith('#')) {
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

    const activeUser = $rootScope.user ? $rootScope.user.username : null;
    if (!activeUser) {
      return '*encrypted comment*'
    }

    // Only comment's owner and parent comment/post's owner can see
    if (![comment.author, comment.parent_author].includes(activeUser)) {
      return '*encrypted comment*'
    }

    // Requires traditional steem login
    if ($rootScope.user.type === 'sc') {
      return '*encrypted comment. use traditional login to see comment.*'
    }

    // Private posting key required
    if(!$rootScope.user.keys.posting){
      return '*encrypted comment. posting private key required to see this comment.*'
    }

    // Get user private memo key
    let privateMemoKey = null;
    try {
      privateMemoKey = cryptoService.decryptKey($rootScope.user.keys['posting']);
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


