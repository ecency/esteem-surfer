import { JSDOM } from 'jsdom';

import proxifyImageSrc from './proxify-image-src';

import markdown2html from './markdown-2-html';

const cache = {};

const image = (entry, width = 0, height = 0) => {
  // return from json metadata if exists
  let meta;

  try {
    meta = JSON.parse(entry.json_metadata);
  } catch (e) {
    meta = null;
  }

  if (meta && meta.image && meta.image.length > 0) {
    if (meta.image[0]) {
      return proxifyImageSrc(meta.image[0], width, height);
    }
  }

  // try to find first image from entry body
  const html = markdown2html(entry.body);
  const dom = new JSDOM(html, {
    ProcessExternalResources: false
  });

  const img = dom.window.document.body.querySelector('img');

  if (img) {
    const src = img.getAttribute('src');
    return proxifyImageSrc(src, width, height);
  }

  return null;
};

export default (entry, width = 0, height = 0) => {
  const key = `${entry.author}-${entry.permlink}`;

  if (cache[key] !== undefined) {
    return cache[key];
  }

  const res = image(entry, width, height);

  cache[key] = res;

  return res;
};
