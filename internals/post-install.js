const fs = require('fs');
const request = require('request');

// Patch iconv-lite package
function patchIconVlite() {
  function writeFile(contents) {
    const file = require.resolve('iconv-lite');

    fs.writeFile(file, contents, err => {
      if (err) {
        console.error(err);
        return;
      }

      console.log('iconv-lite patched!');
    });
  }

  request.get(
    'https://raw.githubusercontent.com/esteemapp/iconv-lite/master/lib/index.js',
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        writeFile(body);
        return;
      }

      console.error('Could not fetch iconv-lite overwrite!');
    }
  );
}

patchIconVlite();
