export const appName = (input) => {
  if (!input) {
    return '';
  }

  if (typeof input === 'string') {
    return input;
  }

  if (typeof input === 'object' && input.name !== undefined) {
    return input.name;
  }

  return '';
};

export const appNameFilter = () => {
  return (input) => {
    return appName(input)
  }
};



