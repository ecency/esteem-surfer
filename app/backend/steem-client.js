import {Client} from 'dsteem';

let client = new Client('https://api.steemit.com');

export const setAddress = (address) => {
  client = new Client(address);
};

export const getActiveVotes = (author, permlink) => client.database.call('get_active_votes', [author, permlink]);

export const getAccounts = (usernames) => (client.database.getAccounts(usernames));

