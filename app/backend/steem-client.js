import { Client, PrivateKey } from 'dsteem';

import sc2 from 'sc2-sdk';

import { scAppAuth, scAppRevoke } from '../helpers/sc';

import { decryptKey } from '../utils/crypto';

import { getItem } from '../helpers/storage';

let client = new Client(getItem('server', 'https://api.steemit.com'));

export const setAddress = address => {
  client = new Client(address);
};

export const getDiscussions = (what, query) =>
  client.database.getDiscussions(what, query);

export const getRepliesByLastUpdate = query =>
  client.database.call('get_replies_by_last_update', [
    query.start_author,
    query.start_permlink,
    query.limit
  ]);

export const getContent = (username, permlink) =>
  client.call('condenser_api', 'get_content', [username, permlink]);

export const getDynamicGlobalProperties = () =>
  client.database.getDynamicGlobalProperties();

export const getFeedHistory = () => client.database.call('get_feed_history');

export const getRewardFund = () =>
  client.database.call('get_reward_fund', ['post']);

export const getActiveVotes = (author, permlink) =>
  client.database.call('get_active_votes', [author, permlink]);

export const getAccounts = usernames => client.database.getAccounts(usernames);

export const getAccount = username =>
  client.database.getAccounts([username]).then(resp => resp[0]);

export const getState = path => client.database.getState(path);

export const getFollowCount = username =>
  client.database.call('get_follow_count', [username]);

export const getFollowing = (
  follower,
  startFollowing,
  followType = 'blog',
  limit = 100
) =>
  client.database.call('get_following', [
    follower,
    startFollowing,
    followType,
    limit
  ]);

export const getAccountRC = username =>
  client.call('rc_api', 'find_rc_accounts', { accounts: [username] });

export const vote = (account, pin, author, permlink, weight) => {
  if (account.type === 's') {
    const key = decryptKey(account.keys.posting, pin);
    const privateKey = PrivateKey.fromString(key);
    const voter = account.username;

    const args = {
      voter,
      author,
      permlink,
      weight
    };

    return client.broadcast.vote(args, privateKey);
  }

  if (account.type === 'sc') {
    const token = decryptKey(account.accessToken, pin);
    const api = sc2.Initialize({
      accessToken: token
    });

    const voter = account.username;

    return api.vote(voter, author, permlink, weight);
  }
};

export const follow = (account, pin, following) => {
  if (account.type === 's') {
    const key = decryptKey(account.keys.posting, pin);
    const privateKey = PrivateKey.fromString(key);
    const follower = account.username;

    const json = {
      id: 'follow',
      json: JSON.stringify([
        'follow',
        {
          follower,
          following,
          what: ['blog']
        }
      ]),
      required_auths: [],
      required_posting_auths: [follower]
    };

    return client.broadcast.json(json, privateKey);
  }

  if (account.type === 'sc') {
    const token = decryptKey(account.accessToken, pin);
    const api = sc2.Initialize({
      accessToken: token
    });

    const follower = account.username;

    return api.follow(follower, following);
  }
};

export const unFollow = (account, pin, following) => {
  if (account.type === 's') {
    const key = decryptKey(account.keys.posting, pin);
    const privateKey = PrivateKey.fromString(key);
    const follower = account.username;

    const json = {
      id: 'follow',
      json: JSON.stringify([
        'follow',
        {
          follower,
          following,
          what: ['']
        }
      ]),
      required_auths: [],
      required_posting_auths: [follower]
    };

    return client.broadcast.json(json, privateKey);
  }

  if (account.type === 'sc') {
    const token = decryptKey(account.accessToken, pin);
    const api = sc2.Initialize({
      accessToken: token
    });

    const follower = account.username;

    return api.unfollow(follower, following);
  }
};

export const ignore = (account, pin, following) => {
  if (account.type === 's') {
    const key = decryptKey(account.keys.posting, pin);
    const privateKey = PrivateKey.fromString(key);
    const follower = account.username;

    const json = {
      id: 'follow',
      json: JSON.stringify([
        'follow',
        {
          follower,
          following,
          what: ['ignore']
        }
      ]),
      required_auths: [],
      required_posting_auths: [follower]
    };

    return client.broadcast.json(json, privateKey);
  }

  if (account.type === 'sc') {
    const token = decryptKey(account.accessToken, pin);
    const api = sc2.Initialize({
      accessToken: token
    });

    const follower = account.username;

    return api.ignore(follower, following);
  }
};

export const revokePostingPermission = (account, pin) => {
  if (account.type === 's') {
    const key = decryptKey(account.keys.active, pin);
    const privateKey = PrivateKey.fromString(key);

    const { accountData } = account;

    const newPosting = Object.assign(
      {},
      { ...accountData.posting },
      {
        account_auths: accountData.posting.account_auths.filter(
          x => x[0] !== 'esteemapp'
        )
      }
    );

    return client.broadcast.updateAccount(
      {
        account: account.username,
        posting: newPosting,
        memo_key: accountData.memo_key,
        json_metadata: accountData.json_metadata
      },
      privateKey
    );
  }

  if (account.type === 'sc') {
    return scAppRevoke();
  }
};

export const grantPostingPermission = (account, pin) => {
  if (account.type === 's') {
    const key = decryptKey(account.keys.active, pin);
    const privateKey = PrivateKey.fromString(key);

    const { accountData } = account;

    const newPosting = Object.assign(
      {},
      { ...accountData.posting },
      {
        account_auths: [
          ...accountData.posting.account_auths,
          ['esteemapp', accountData.posting.weight_threshold]
        ]
      }
    );

    return client.broadcast.updateAccount(
      {
        account: account.username,
        posting: newPosting,
        active: undefined,
        memo_key: accountData.memo_key,
        json_metadata: accountData.json_metadata
      },
      privateKey
    );
  }

  if (account.type === 'sc') {
    return scAppAuth();
  }
};

export const comment = (
  account,
  pin,
  parentAuthor,
  parentPermlink,
  permlink,
  title,
  body,
  jsonMetadata,
  options,
  voteWeight
) => {
  const { username: author } = account;

  if (account.type === 's') {
    const opArray = [
      [
        'comment',
        {
          parent_author: parentAuthor,
          parent_permlink: parentPermlink,
          author,
          permlink,
          title,
          body,
          json_metadata: JSON.stringify(jsonMetadata)
        }
      ]
    ];

    if (options) {
      const e = ['comment_options', options];
      opArray.push(e);
    }

    if (voteWeight) {
      const e = [
        'vote',
        {
          voter: author,
          author,
          permlink,
          weight: voteWeight
        }
      ];
      opArray.push(e);
    }

    const key = decryptKey(account.keys.posting, pin);
    const privateKey = PrivateKey.fromString(key);

    return client.broadcast.sendOperations(opArray, privateKey);
  }

  if (account.type === 'sc') {
    const token = decryptKey(account.accessToken, pin);
    const api = sc2.Initialize({
      accessToken: token
    });

    const params = {
      parent_author: parentAuthor,
      parent_permlink: parentPermlink,
      author,
      permlink,
      title,
      body,
      json_metadata: JSON.stringify(jsonMetadata)
    };

    const opArray = [['comment', params]];

    if (options) {
      const e = ['comment_options', options];
      opArray.push(e);
    }

    if (voteWeight) {
      const e = [
        'vote',
        {
          voter: author,
          author,
          permlink,
          weight: voteWeight
        }
      ];
      opArray.push(e);
    }

    return api.broadcast(opArray);
  }
};

export const reblog = (account, pin, author, permlink) => {
  if (account.type === 's') {
    const key = decryptKey(account.keys.posting, pin);
    const privateKey = PrivateKey.fromString(key);
    const follower = account.username;

    const json = {
      id: 'follow',
      json: JSON.stringify([
        'reblog',
        {
          account: follower,
          author,
          permlink
        }
      ]),
      required_auths: [],
      required_posting_auths: [follower]
    };

    return client.broadcast.json(json, privateKey);
  }

  if (account.type === 'sc') {
    const token = decryptKey(account.accessToken, pin);
    const api = sc2.Initialize({
      accessToken: token
    });

    const follower = account.username;

    return api.reblog(follower, author, permlink);
  }
};
