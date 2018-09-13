// @flow

import {Client} from 'dsteem';

const client = new Client('https://api.steemit.com');

export const getActiveVotes = (author: string, permlink: string) => {
  return client.database.call('get_active_votes', [author, permlink]);
};