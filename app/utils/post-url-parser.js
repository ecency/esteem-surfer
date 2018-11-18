export default url => {
  const parseSteemit = u => {
    const r = /^https?:\/\/(.*)\/(.*)\/(@[\w.\d-]+)\/(.*)/i;
    const match = u.match(r);
    if (match && match.length === 5) {
      return {
        author: match[3].replace('@', ''),
        permlink: match[4]
      };
    }

    return null;
  };

  const parseBusy = u => {
    const r = /^https?:\/\/(.*)\/(@[\w.\d-]+)\/(.*)/i;
    const match = u.match(r);
    if (match && match.length === 4) {
      return {
        author: match[2].replace('@', ''),
        permlink: match[3]
      };
    }

    return null;
  };

  if (url.startsWith('https://steemit.com')) {
    return parseSteemit(url);
  }

  if (url.startsWith('https://busy.org')) {
    return parseBusy(url);
  }

  // For non url's like @good-karma/esteem-london-presentation-e3105ba6637ed
  const match = url.match(/^[/]?(@[\w.\d-]+)\/(.*)/);
  if (match && match.length === 3) {
    return {
      author: match[1].replace('@', ''),
      permlink: match[2]
    };
  }

  return null;
};
