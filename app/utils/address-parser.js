import filters from '../constants/filters';
import postUrlParser from './post-url-parser';

export default inp => {
  const pa = inp
    .replace(/\//g, ' ')
    .trim()
    .split(' ');

  // filter or filter + tag
  if ([1, 2].includes(pa.length) && filters.includes(pa[0])) {
    const [filter, tag] = pa;
    const path = tag ? `/${pa[0]}/${pa[1]}` : `/${pa[0]}`;
    return {
      type: 'filter',
      filter,
      tag,
      path
    };
  }

  // @user && user + section
  if ([1, 2].includes(pa.length) && pa[0].startsWith('@')) {
    const [author, filter] = pa;

    if (!filter) {
      return {
        type: 'author',
        author: author.replace('@', ''),
        filter,
        path: `/${author}`
      };
    }

    if (
      filter &&
      ['blog', 'comments', 'replies', 'wallet', 'points', 'feed'].includes(
        filter
      )
    ) {
      return {
        type: 'author',
        author: author.replace('@', ''),
        filter,
        path: `/${author}/${filter}`
      };
    }
  }

  // post
  const entryData = postUrlParser(inp);
  if (entryData) {
    const { author, permlink } = entryData;
    return {
      type: 'post',
      author,
      permlink
    };
  }

  return inp;
};
