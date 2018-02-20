export const catchPostImage = (post) => {
  let meta = JSON.parse(post.json_metadata);
  if (meta.image && meta.image.length > 0) {
    return meta.image[0];
  }
  return null;
};

export const catchPostImageFilter = () => {
  return (post) => {
    return catchPostImage(post);
  }
};
