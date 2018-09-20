import { Client } from 'dsteem';

const client = new Client('https://api.steemit.com');

export const getActiveVotes = (author, permlink) =>
  client.database.call('get_active_votes', [author, permlink]);

export const foo = 'FOO';
