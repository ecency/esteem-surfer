import constants from '../constants';

const filters = constants.filters.map(x => x.name);


export const protocolUrl2Obj = (url) => {
  let urlPart = url.split('://')[1];

  // remove last char if /
  if(urlPart.endsWith('/')){
    urlPart = urlPart.substring(0, urlPart.length - 1);
  }

  const parts = urlPart.split('/');

  // filter
  if (parts.length === 1 && filters.includes(parts[0])) {
    return {type: 'filter', filter: parts[0]};
  }

  // filter with tag
  if (parts.length === 2 && filters.includes(parts[0])) {
    return {type: 'filter-tag', filter: parts[0], tag: parts[1]};
  }

  // account
  if (parts.length === 1 && parts[0].startsWith('@')) {
    return {type: 'account', account: parts[0].replace('@', '')};
  }

  // post
  if (parts.length === 3 && parts[1].startsWith('@')) {
    return {type: 'post', cat: parts[0], author: parts[1].replace('@', ''), permlink: parts[2]};
  }
};
