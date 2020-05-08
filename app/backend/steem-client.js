/*
eslint-disable no-underscore-dangle
*/

import { Client, PrivateKey, cryptoUtils } from '@esteemapp/dhive';

import sc2 from 'hivesigner';

import defaults from '../constants/defaults';

import {
  scAppAuth,
  scAppRevoke,
  scWitnessVote,
  scWitnessProxy,
  scTransfer,
  scTransferToSavings,
  scTransferFromSavings,
  scTransferToVesting,
  scConvert,
  scDelegateVestingShares,
  scWithdrawVesting,
  sctTransferPoint,
  scPromote,
  scBoost,
  scVoteProposal
} from '../helpers/sc';

import { decryptKey } from '../utils/crypto';

import { getItem } from '../helpers/storage';

import { usrActivity } from './esteem-client';
import { PIN_KEY } from '../config';

let client = new Client(getItem('server2', defaults.servers), {
  timeout: 5000
});

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

export const getFollowers = (
  following,
  startFollowing,
  followType = 'blog',
  limit = 100
) =>
  client.database.call('get_followers', [
    following,
    startFollowing,
    followType,
    limit
  ]);

export const getAccountRC = username =>
  client.call('rc_api', 'find_rc_accounts', { accounts: [username] });

export const getWitnessesByVote = (from = undefined, limit = 100) =>
  client.call('database_api', 'get_witnesses_by_vote', [from, limit]);

const _vote = (account, pin, author, permlink, weight) => {
  if (account.type === 's') {
    const key = decryptKey(account.keys, pin);
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

    return api.vote(voter, author, permlink, weight).then(resp => resp.result);
  }
};

export const vote = (account, pin, author, permlink, weight) =>
  _vote(account, pin, author, permlink, weight).then(resp => {
    usrActivity(account.username, 120, resp.block_num, resp.id);
    return resp;
  });

export const follow = (account, pin, following) => {
  if (account.type === 's') {
    const key = decryptKey(account.keys, pin);
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
    const key = decryptKey(account.keys, pin);
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
    const key = decryptKey(account.keys, pin);
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
    const key = decryptKey(account.keys, pin);
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

export const signImage = async (file, account, pin) => {
  const data = Buffer.from(`${account.username}${PIN_KEY}`);
  const prefix = Buffer.from('ImageSigningChallenge');
  const buf = Buffer.concat([prefix, data]);
  const bufSha = cryptoUtils.sha256(buf);

  if (account.type === 's') {
    const key = decryptKey(account.keys, pin);
    const privateKey = PrivateKey.fromString(key);
    const signature = privateKey.sign(bufSha);
    return `stndt${signature}pupload`;
  }
  if (account.type === 'sc') {
    const token = decryptKey(account.accessToken, pin);
    return `hive${token}signer`;
  }
};

export const grantPostingPermission = (account, pin) => {
  if (account.type === 's') {
    const key = decryptKey(account.keys, pin);
    const privateKey = PrivateKey.fromString(key);

    const { accountData } = account;

    if (!accountData) {
      return Promise.reject(
        new Error("Please wait while your account's data loading...")
      );
    }

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

export const updateProfile = (account, pin, newProfile) => {
  if (account.type === 's') {
    const key = decryptKey(account.keys, pin);
    const privateKey = PrivateKey.fromString(key);

    const { accountData } = account;

    let curJsonMeta;
    try {
      curJsonMeta = JSON.parse(accountData.json_metadata);
    } catch (e) {
      curJsonMeta = {};
    }

    const newJsonMeta = Object.assign({}, curJsonMeta, newProfile);

    return client.broadcast.updateAccount(
      {
        account: account.username,
        memo_key: accountData.memo_key,
        json_metadata: JSON.stringify(newJsonMeta)
      },
      privateKey
    );
  }

  if (account.type === 'sc') {
    return Promise.reject(
      new Error('Steem connect profile update not implemented yet.')
    );
  }
};

export const updatePassword = (account, ownerKey, newPublicKeys) => {
  if (account.type === 's') {
    const { accountData } = account;

    const update = {
      account: account.username,
      json_metadata: accountData.json_metadata,
      owner: Object.assign({}, accountData.owner, {
        key_auths: [[newPublicKeys.owner, 1]]
      }),
      active: Object.assign({}, accountData.active, {
        key_auths: [[newPublicKeys.active, 1]]
      }),
      posting: Object.assign({}, accountData.posting, {
        key_auths: [[newPublicKeys.posting, 1]]
      }),
      memo_key: newPublicKeys.memo
    };

    const privateKey = PrivateKey.fromString(ownerKey);

    return client.broadcast.updateAccount(update, privateKey);
  }

  if (account.type === 'sc') {
    return Promise.reject(
      new Error('Steem connect password update not implemented yet.')
    );
  }
};

export const deleteComment = (account, pin, permlink) => {
  const { username: author } = account;

  if (account.type === 's') {
    const opArray = [
      [
        'delete_comment',
        {
          author,
          permlink
        }
      ]
    ];

    const key = decryptKey(account.keys, pin);
    const privateKey = PrivateKey.fromString(key);

    return client.broadcast.sendOperations(opArray, privateKey);
  }

  if (account.type === 'sc') {
    const token = decryptKey(account.accessToken, pin);
    const api = sc2.Initialize({
      accessToken: token
    });

    const params = {
      author,
      permlink
    };

    const opArray = [['delete_comment', params]];

    return api.broadcast(opArray).then(resp => resp.result);
  }
};

const _comment = (
  account,
  pin,
  parentAuthor,
  parentPermlink,
  permlink,
  title,
  body,
  jsonMetadata,
  options = null,
  voteWeight = null
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

    const key = decryptKey(account.keys, pin);
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

    return api.broadcast(opArray).then(resp => resp.result);
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
  options = null,
  voteWeight = null
) =>
  _comment(
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
  ).then(resp => {
    if (options) {
      const t = title ? 100 : 110;
      usrActivity(account.username, t, resp.block_num, resp.id);
    }
    return resp;
  });

export const reblog = (account, pin, author, permlink) =>
  _reblog(account, pin, author, permlink).then(resp => {
    usrActivity(account.username, 130, resp.block_num, resp.id);
    return resp;
  });

const _reblog = (account, pin, author, permlink) => {
  if (account.type === 's') {
    const key = decryptKey(account.keys, pin);
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

    return api.reblog(follower, author, permlink).then(resp => resp.result);
  }
};

export const claimRewardBalance = (
  account,
  pin,
  rewardSteem,
  rewardSbd,
  rewardVests
) => {
  if (account.type === 's') {
    const key = decryptKey(account.keys, pin);
    const privateKey = PrivateKey.fromString(key);

    const opArray = [
      [
        'claim_reward_balance',
        {
          account: account.username,
          reward_steem: rewardSteem,
          reward_sbd: rewardSbd,
          reward_vests: rewardVests
        }
      ]
    ];

    return client.broadcast.sendOperations(opArray, privateKey);
  }

  if (account.type === 'sc') {
    const token = decryptKey(account.accessToken, pin);
    const api = sc2.Initialize({
      accessToken: token
    });

    return api.claimRewardBalance(
      account.username,
      rewardSteem,
      rewardSbd,
      rewardVests
    );
  }
};

export const witnessVote = (account, pin, witness, approve) => {
  if (account.type === 's') {
    const opArray = [
      [
        'account_witness_vote',
        {
          account: account.username,
          witness,
          approve
        }
      ]
    ];

    const key = decryptKey(account.keys, pin);
    const privateKey = PrivateKey.fromString(key);

    return client.broadcast.sendOperations(opArray, privateKey);
  }

  if (account.type === 'sc') {
    return scWitnessVote(account.username, witness, approve);
  }
};

export const witnessProxy = (account, pin, proxy) => {
  if (account.type === 's') {
    const opArray = [
      [
        'account_witness_proxy',
        {
          account: account.username,
          proxy
        }
      ]
    ];

    const key = decryptKey(account.keys, pin);
    const privateKey = PrivateKey.fromString(key);

    return client.broadcast.sendOperations(opArray, privateKey);
  }

  if (account.type === 'sc') {
    return scWitnessProxy(account.username, proxy);
  }
};

export const transfer = (account, pin, to, amount, memo) => {
  const { username: from } = account;

  if (account.type === 's') {
    const key = decryptKey(account.keys, pin);
    const privateKey = PrivateKey.fromString(key);

    const args = {
      from,
      to,
      amount,
      memo
    };

    return client.broadcast.transfer(args, privateKey);
  }

  if (account.type === 'sc') {
    return scTransfer(from, to, amount, memo);
  }
};

export const convert = (account, pin, amount, requestid) => {
  const { username: from } = account;
  if (account.type === 's') {
    const key = decryptKey(account.keys, pin);
    const privateKey = PrivateKey.fromString(key);
    const opArray = [
      [
        'convert',
        {
          owner: from,
          amount,
          requestid
        }
      ]
    ];
    return client.broadcast.sendOperations(opArray, privateKey);
  }
  if (account.type === 'sc') {
    return scConvert(from, amount, requestid);
  }
};

export const transferToSavings = (account, pin, to, amount, memo) => {
  const { username: from } = account;

  if (account.type === 's') {
    const key = decryptKey(account.keys, pin);
    const privateKey = PrivateKey.fromString(key);

    const opArray = [
      [
        'transfer_to_savings',
        {
          from,
          to,
          amount,
          memo
        }
      ]
    ];

    return client.broadcast.sendOperations(opArray, privateKey);
  }

  if (account.type === 'sc') {
    return scTransferToSavings(from, to, amount, memo);
  }
};

export const transferFromSavings = (
  account,
  pin,
  requestId,
  to,
  amount,
  memo
) => {
  const { username: from } = account;

  if (account.type === 's') {
    const key = decryptKey(account.keys, pin);
    const privateKey = PrivateKey.fromString(key);

    const opArray = [
      [
        'transfer_from_savings',
        {
          from,
          to,
          amount,
          memo,
          request_id: requestId
        }
      ]
    ];

    return client.broadcast.sendOperations(opArray, privateKey);
  }

  if (account.type === 'sc') {
    return scTransferFromSavings(from, requestId, to, amount, memo);
  }
};

export const transferToVesting = (account, pin, to, amount) => {
  const { username: from } = account;

  if (account.type === 's') {
    const key = decryptKey(account.keys, pin);
    const privateKey = PrivateKey.fromString(key);

    const opArray = [
      [
        'transfer_to_vesting',
        {
          from,
          to,
          amount
        }
      ]
    ];

    return client.broadcast.sendOperations(opArray, privateKey);
  }

  if (account.type === 'sc') {
    return scTransferToVesting(from, to, amount);
  }
};

export const delegateVestingShares = (
  account,
  pin,
  delegatee,
  vestingShares
) => {
  const { username: delegator } = account;

  if (account.type === 's') {
    const key = decryptKey(account.keys, pin);
    const privateKey = PrivateKey.fromString(key);

    const opArray = [
      [
        'delegate_vesting_shares',
        {
          delegator,
          delegatee,
          vesting_shares: vestingShares
        }
      ]
    ];

    return client.broadcast.sendOperations(opArray, privateKey);
  }

  if (account.type === 'sc') {
    return scDelegateVestingShares(delegator, delegatee, vestingShares);
  }
};

export const getVestingDelegations = (account, from = '', limit = 50) =>
  client.database.call('get_vesting_delegations', [account, from, limit]);

export const withdrawVesting = (account, pin, vestingShares) => {
  if (account.type === 's') {
    const key = decryptKey(account.keys, pin);
    const privateKey = PrivateKey.fromString(key);

    const opArray = [
      [
        'withdraw_vesting',
        {
          account: account.username,
          vesting_shares: vestingShares
        }
      ]
    ];

    return client.broadcast.sendOperations(opArray, privateKey);
  }

  if (account.type === 'sc') {
    return scWithdrawVesting(account.username, vestingShares);
  }
};

export const getWithdrawRoutes = account =>
  client.database.call('get_withdraw_routes', [account, 'outgoing']);

export const setWithdrawVestingRoute = (
  account,
  pin,
  to,
  percent,
  autoVest
) => {
  if (account.type === 's') {
    const key = decryptKey(account.keys, pin);
    const privateKey = PrivateKey.fromString(key);

    const opArray = [
      [
        'set_withdraw_vesting_route',
        {
          from_account: account.username,
          to_account: to,
          percent,
          auto_vest: autoVest
        }
      ]
    ];

    return client.broadcast.sendOperations(opArray, privateKey);
  }

  if (account.type === 'sc') {
    return Promise.reject(
      new Error('Steem connect setWithdrawVestingRoute not implemented yet.')
    );
  }
};

export const transferPoint = (account, pin, to, amount, memo) => {
  const { username: from } = account;

  const json = JSON.stringify({
    sender: from,
    receiver: to,
    amount,
    memo
  });

  if (account.type === 's') {
    const key = decryptKey(account.keys, pin);
    const privateKey = PrivateKey.fromString(key);

    const op = {
      id: 'esteem_point_transfer',
      json,
      required_auths: [from],
      required_posting_auths: []
    };

    return client.broadcast.json(op, privateKey);
  }

  if (account.type === 'sc') {
    return sctTransferPoint(from, json);
  }
};

export const promote = (account, pin, user, author, permlink, duration) => {
  const { username: from } = account;

  const json = JSON.stringify({
    user,
    author,
    permlink,
    duration
  });

  if (account.type === 's') {
    const key = decryptKey(account.keys, pin);
    const privateKey = PrivateKey.fromString(key);

    const op = {
      id: 'esteem_promote',
      json,
      required_auths: [from],
      required_posting_auths: []
    };

    return client.broadcast.json(op, privateKey);
  }

  if (account.type === 'sc') {
    return scPromote(from, json);
  }
};

export const boost = (account, pin, user, author, permlink, amount) => {
  const { username: from } = account;

  const json = JSON.stringify({
    user,
    author,
    permlink,
    amount
  });

  if (account.type === 's') {
    const key = decryptKey(account.keys, pin);
    const privateKey = PrivateKey.fromString(key);

    const op = {
      id: 'esteem_boost',
      json,
      required_auths: [from],
      required_posting_auths: []
    };

    return client.broadcast.json(op, privateKey);
  }

  if (account.type === 'sc') {
    return scBoost(from, json);
  }
};

export const getProposals = () =>
  client
    .call('database_api', 'list_proposals', {
      start: [-1],
      limit: 100,
      order: 'by_total_votes',
      order_direction: 'descending',
      status: 'all'
    })
    .then(resp => resp.proposals)
    .catch(() => []);

export const getProposalVoters = proposalId =>
  client
    .call('condenser_api', 'list_proposal_votes', [
      [proposalId, ''],
      300,
      'by_proposal_voter'
    ])
    .then(resp => resp.filter(x => x.proposal.id === proposalId))
    .then(resp => resp.map(x => x.voter))
    .catch(() => []);

export const voteProposal = (account, pin, proposalId, approve) => {
  const { username: voter } = account;

  if (account.type === 's') {
    const key = decryptKey(account.keys, pin);
    const privateKey = PrivateKey.fromString(key);

    const opArray = [
      [
        'update_proposal_votes',
        {
          voter,
          proposal_ids: [proposalId],
          approve,
          extensions: []
        }
      ]
    ];

    return client.broadcast.sendOperations(opArray, privateKey);
  }

  if (account.type === 'sc') {
    return scVoteProposal(account.username, proposalId, approve);
  }
};
