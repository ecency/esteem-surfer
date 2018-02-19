export const capWord = (input) => {
  if (!input) {
    return input;
  }
  input = input.trim();
  return input.trim().substr(0, 1).toUpperCase() + input.substr(1)
};

export const capWordFilter = () => {
  return (input) => {
    return capWord(input)
  }
};



