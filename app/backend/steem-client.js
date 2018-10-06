import { Client, PrivateKey } from 'dsteem';
import sc2 from 'sc2-sdk';

import { decryptKey } from '../utils/crypto';

let client = new Client('https://api.steemit.com');

export const setAddress = address => {
  client = new Client(address);
};

export const getDiscussions = (what, query) =>
  client.database.getDiscussions(what, query);

export const getDynamicGlobalProperties = () =>
  client.database.getDynamicGlobalProperties();

export const getFeedHistory = () => client.database.call('get_feed_history');

export const getRewardFund = () =>
  client.database.call('get_reward_fund', ['post']);

export const getActiveVotes = (author, permlink) =>
  client.database.call('get_active_votes', [author, permlink]);

export const getAccounts = usernames => client.database.getAccounts(usernames);

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
};
