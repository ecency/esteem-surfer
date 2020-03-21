const strShareSuffix = 'shared via eSteem';

export const makeEsteemUrl = (cat, author, permlink) =>
  `https://esteem.app/${cat}/@${author}/${permlink}`;

export const makeCopyAddress = (title, cat, author, permlink) =>
  `[${title}](/${cat}/@${author}/${permlink})`;

export const makeShareUrlReddit = (cat, author, permlink, title) => {
  const u = makeEsteemUrl(cat, author, permlink);
  const t = `${title} | ${strShareSuffix}`;
  return `https://reddit.com/submit?url=${encodeURIComponent(
    u
  )}&title=${encodeURIComponent(t)}`;
};

export const makeShareUrlTwitter = (cat, author, permlink, title) => {
  const u = makeEsteemUrl(cat, author, permlink);
  const t = `${title} | ${strShareSuffix}`;
  return `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    u
  )}&text=${encodeURIComponent(t)}`;
};

export const makeShareUrlFacebook = (cat, author, permlink) => {
  const u = makeEsteemUrl(cat, author, permlink);
  return `https://www.facebook.com/sharer.php?u=${encodeURIComponent(u)}`;
};
