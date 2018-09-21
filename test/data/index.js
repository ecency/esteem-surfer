const fs = require('fs');

export const getTestData = (author, permlink) => {
  const fileName = `${author}-${permlink}.json`;
  const readPath = `${__dirname}/json/${fileName}`;

  return fs.readFileSync(readPath);
};

export const foo = 'foo';
