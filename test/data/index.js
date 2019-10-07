const fs = require('fs');

export const getTestData = (author, permlink) => {
  const fileName = `${author}____${permlink}.json`;
  const readPath = `${__dirname}/json/${fileName}`;

  const raw = fs.readFileSync(readPath, 'utf-8');

  return JSON.parse(raw);
};

export const foo = 'foo';
