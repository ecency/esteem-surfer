import React from 'react';
import PropTypes from 'prop-types';

import filters from '../../constants/filters.json';

import { makePath as makePathTag } from './TagLink';
import { makePath as makePathAccount } from './AccountLink';
import { makePath as makePathEntry } from './EntryLink';

export const deepLink2Obj = url => {
  let urlPart = url.split('://')[1];

  // remove last char if /
  if (urlPart.endsWith('/')) {
    urlPart = urlPart.substring(0, urlPart.length - 1);
  }

  const parts = urlPart.split('/');

  // witnesses
  if (parts.length === 1 && parts[0] === 'witnesses') {
    return { type: 'witnesses' };
  }

  // sps
  if (parts.length === 1 && parts[0] === 'sps') {
    return { type: 'sps' };
  }

  // filter
  if (parts.length === 1 && filters.includes(parts[0])) {
    return { type: 'filter', filter: parts[0] };
  }

  // filter with tag
  if (parts.length === 2 && filters.includes(parts[0])) {
    return { type: 'filter-tag', filter: parts[0], tag: parts[1] };
  }

  // account
  if (parts.length === 1 && parts[0].startsWith('@')) {
    return { type: 'account', account: parts[0].replace('@', '') };
  }

  // post without tag
  if (parts.length === 2 && parts[0].startsWith('@')) {
    return {
      type: 'post',
      cat: 'esteem',
      author: parts[0].replace('@', ''),
      permlink: parts[1]
    };
  }

  // post with tag
  if (parts.length === 3 && parts[1].startsWith('@')) {
    return {
      type: 'post',
      cat: parts[0],
      author: parts[1].replace('@', ''),
      permlink: parts[2]
    };
  }
};

class DeepLinkHandler extends React.Component {
  componentDidMount() {
    window.addEventListener('deep-link', this.handler);
  }

  componentWillUnmount() {
    window.removeEventListener('deep-link', this.handler);
  }

  handler = e => {
    const { history } = this.props;
    const { url } = e.detail;
    const obj = deepLink2Obj(url);

    let path;

    switch (obj.type) {
      case 'filter':
        path = `/${obj.filter}`;
        break;
      case 'filter-tag':
        path = makePathTag(obj.filter, obj.tag);
        break;
      case 'account':
        path = makePathAccount(obj.account);
        break;
      case 'post':
        path = makePathEntry(obj.cat, obj.author, obj.permlink);
        break;
      case 'sps':
        path = `/sps`;
        break;
      case 'witnesses':
        path = `/witnesses`;
        break;
      default:
        path = null;
        break;
    }

    if (path) {
      history.push(path);
    }
  };

  render() {
    return null;
  }
}

DeepLinkHandler.propTypes = {
  history: PropTypes.shape({}).isRequired
};

export default DeepLinkHandler;
