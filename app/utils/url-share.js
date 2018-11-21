const strShareSuffix = 'shared via eSteem Surfer';

export const makeSteemitUrl = (cat, author, permlink) =>
  `https://steemit.com/${cat}/@${author}/${permlink}`;

export const makeBusyUrl = (author, permlink) =>
  `https://busy.org/@${author}/${permlink}`;

export const makeCopyAddress = (title, cat, author, permlink) =>
  `[${title}](/${cat}/@${author}/${permlink})`;

export const makeShareUrlReddit = (cat, author, permlink, title) => {
  const u = makeSteemitUrl(cat, author, permlink);
  const t = `${title} | ${strShareSuffix}`;
  return `https://reddit.com/submit?url=${encodeURIComponent(
    u
  )}&title=${encodeURIComponent(t)}`;
};

export const makeShareUrlTwitter = (cat, author, permlink, title) => {
  const u = makeSteemitUrl(cat, author, permlink);
  const t = `${title} | ${strShareSuffix}`;
  return `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    u
  )}&text=${encodeURIComponent(t)}`;
};

export const makeShareUrlFacebook = (cat, author, permlink) => {
  const u = makeSteemitUrl(cat, author, permlink);
  return `https://www.facebook.com/sharer.php?u=${encodeURIComponent(u)}`;
};
