export default () => {
  return (inp) => {
    let meta = JSON.parse(inp.json_metadata);
    if (meta.image && meta.image.length > 0) {
      return meta.image[0];
    }

    return null;
  }
}
