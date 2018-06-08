import {proxifyImageSrc} from '../helpers/proxify-image-src';

export const catchPostImage = (post) => {

  let meta = null;

  try {
    meta = JSON.parse(post.json_metadata);
  } catch (e) {
  }

  if (meta && meta.image && meta.image.length > 0) {
    return proxifyImageSrc(meta.image[0]);
  } else {
    // If no image specified in json metadata, try extract first image href from post body
    let imgReg = /\<img.+src\=(?:\"|\')(.+?)(?:\"|\')(.*)>/;
    let bodyMatch = post.body.match(imgReg);
    if (bodyMatch) {
      return proxifyImageSrc(bodyMatch[1]);
    } else {
      // If there is no <img> tag, check from markdown img tag ![](image.png)
      imgReg = /(?:!\[(.*?)\]\((.*?)\))/;
      bodyMatch = imgReg.exec(post.body);
      if (bodyMatch) {
       return proxifyImageSrc(bodyMatch[2]);
      }
    }
  }
  return null;
};

export const catchPostImageFilter = () => {
  return (post) => {
    return catchPostImage(post);
  }
};
