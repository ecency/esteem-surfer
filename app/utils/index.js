export const flattenMessages = (nestedMessages, prefix = '') =>
  Object.keys(nestedMessages).reduce((messages, key) => {
    const m = messages;
    const value = nestedMessages[key];
    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      m[prefixedKey] = value;
    } else {
      Object.assign(m, flattenMessages(value, prefixedKey));
    }

    return m;
  }, {});

export { flattenMessages as default };
