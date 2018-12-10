const fs = require('fs');
const { Client } = require('../../app/node_modules/dsteem');

const client = new Client('https://api.steemit.com');

const author = process.argv[2];
const permlink = process.argv[3];

const error = msg => {
  console.log('\x1b[31m', msg, '\x1b[0m');
};

client.database
  .call('get_content', [author, permlink])
  .then(resp => {
    if (resp.id === 0) {
      error(`${author}/${permlink} not found!`);
      return;
    }

    const fileName = `${author}____${permlink}.json`;
    const savePath = `${__dirname}/json/${fileName}`;
    if (fs.existsSync(savePath)) {
      error(`${fileName} already exists!`);
      return;
    }

    fs.writeFileSync(savePath, JSON.stringify(resp, 0, 2), 'utf-8');

    return resp;
  })
  .catch(err => {
    error(err);
  });
