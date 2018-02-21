export const catchPostImage = (post) => {
  let meta = JSON.parse(post.json_metadata);
  if (meta.image && meta.image.length > 0) {
    return meta.image[0];
  } else {
    // If no image specified in json metadata, try extract first image href from post body
    let imgReg = /\<img.+src\=(?:\"|\')(.+?)(?:\"|\')(.*)>/;
    let bodyMatch = post.body.match(imgReg);
    if (bodyMatch) {
      return bodyMatch[1];
    }
  }
  return null;
};

export const catchPostImageFilter = () => {
  return (post) => {
    return catchPostImage(post);
  }
};
