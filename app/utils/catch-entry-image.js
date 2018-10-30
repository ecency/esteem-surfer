import proxifyImageSrc from './proxify-image-src';

export default (entry, width = 0, height = 0) => {
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

  // try to extract images by regex
  const imgReg2 = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpe?g|gif|png)/gim;
  const m = entry.body.match(imgReg2);
  if (m) {
    return proxifyImageSrc(m[0], width, height);
  }

  // If no image specified in json metadata, try extract first image href from entry body
  let imgReg = /<img.+src=(?:"|')(.+?)(?:"|')(.*)>/;
  let bodyMatch = entry.body.match(imgReg);
  if (bodyMatch) {
    return proxifyImageSrc(bodyMatch[1], width, height);
  }

  // If there is no <img> tag, check from markdown img tag ![](image.png)
  imgReg = /(?:!\[(.*?)\]\((.*?)\))/;
  bodyMatch = imgReg.exec(entry.body);
  if (bodyMatch) {
    return proxifyImageSrc(bodyMatch[2], width, height);
  }

  return null;
};
