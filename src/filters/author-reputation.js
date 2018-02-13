export default () => {
  return (value, bool) => {
    let reputation_level = 1;
    let neg = false;

    if (value < 0)
      neg = true;

    if (value !== 0) {
      reputation_level = Math.log10(Math.abs(value));
      reputation_level = Math.max(reputation_level - 9, 0);

      if (reputation_level < 0)
        reputation_level = 0;
      if (neg)
        reputation_level *= -1;

      reputation_level = (reputation_level * 9) + 25;
    } else {
      return 25;
    }

    return bool ? reputation_level : Math.floor(reputation_level);
  }
}
