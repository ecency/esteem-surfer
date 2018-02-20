export const authorReputation = (input) => {

  if (input === 0) {
    return 25;
  }

  if (!input) {
    return input;
  }

  let neg = false;

  if (input < 0)
    neg = true;

  let reputation_level = Math.log10(Math.abs(input));
  reputation_level = Math.max(reputation_level - 9, 0);

  if (reputation_level < 0)
    reputation_level = 0;
  if (neg)
    reputation_level *= -1;

  reputation_level = (reputation_level * 9) + 25;

  return Math.floor(reputation_level);
};


export const authorReputationFilter = () => {
  return (value) => {
    return authorReputation(value);
  }
};
