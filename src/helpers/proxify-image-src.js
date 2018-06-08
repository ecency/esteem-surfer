export const proxifyImageSrc = (url) => {
  const prefix = 'https://steemitimages.com/0x0/';

  if (url.startsWith(prefix)) return url;

  return `${prefix}${url}`;
};
