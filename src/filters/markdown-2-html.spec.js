import {markDown2Html, replaceAuthorNames, replaceTags} from './markdown-2-html';
import {expect} from "chai";

const path = require('path');

const fs = require('fs');


describe('Replace Author Names', function () {
  it('Should replace author names with link for given string', function () {

    let input = 'lorem ipsum @dolor sit amet';
    let expected = "lorem ipsum <a class='markdown-author-link' data-author='dolor'>@dolor</a> sit amet";
    expect(replaceAuthorNames(input)).to.equal(expected);


    input = '@lorem ipsum @dolor sit amet';
    expected = "<a class='markdown-author-link' data-author='lorem'>@lorem</a> ipsum <a class='markdown-author-link' data-author='dolor'>@dolor</a> sit amet";
    expect(replaceAuthorNames(input)).to.equal(expected);


    input = '@lorem @ipsum @dolor sit amet';
    expected = "<a class='markdown-author-link' data-author='lorem'>@lorem</a> <a class='markdown-author-link' data-author='ipsum'>@ipsum</a> <a class='markdown-author-link' data-author='dolor'>@dolor</a> sit amet";
    expect(replaceAuthorNames(input)).to.equal(expected);


    input = '@lorem @ipsum @dolor \n @sit amet';
    expected = "<a class='markdown-author-link' data-author='lorem'>@lorem</a> <a class='markdown-author-link' data-author='ipsum'>@ipsum</a> <a class='markdown-author-link' data-author='dolor'>@dolor</a> \n <a class='markdown-author-link' data-author='sit'>@sit</a> amet";
    expect(replaceAuthorNames(input)).to.equal(expected);


    input = '@lorem @ipsum @dolor \n @Sit amet';
    expected = "<a class='markdown-author-link' data-author='lorem'>@lorem</a> <a class='markdown-author-link' data-author='ipsum'>@ipsum</a> <a class='markdown-author-link' data-author='dolor'>@dolor</a> \n <a class='markdown-author-link' data-author='Sit'>@Sit</a> amet";
    expect(replaceAuthorNames(input)).to.equal(expected);
  });
});


describe('Replace Tags', function () {
  it('Should replace tags with link for given string', function () {

    let input = 'lorem ipsum #dolor sit amet';
    let expected = "lorem ipsum <a class='markdown-tag-link' data-tag='dolor'>#dolor</a> sit amet";
    expect(replaceTags(input)).to.equal(expected);


    input = '#lorem ipsum #dolor sit amet';
    expected = "<a class='markdown-tag-link' data-tag='lorem'>#lorem</a> ipsum <a class='markdown-tag-link' data-tag='dolor'>#dolor</a> sit amet";
    expect(replaceTags(input)).to.equal(expected);


    input = '#lorem #ipsum #dolor sit amet';
    expected = "<a class='markdown-tag-link' data-tag='lorem'>#lorem</a> <a class='markdown-tag-link' data-tag='ipsum'>#ipsum</a> <a class='markdown-tag-link' data-tag='dolor'>#dolor</a> sit amet";
    expect(replaceTags(input)).to.equal(expected);

    input = '#lorem #ipsum #dolor \n #sit amet';
    expected = "<a class='markdown-tag-link' data-tag='lorem'>#lorem</a> <a class='markdown-tag-link' data-tag='ipsum'>#ipsum</a> <a class='markdown-tag-link' data-tag='dolor'>#dolor</a> \n <a class='markdown-tag-link' data-tag='sit'>#sit</a> amet";
    expect(replaceTags(input)).to.equal(expected);

    input = '#lorem #ipsum #dolor \n #Sit amet';
    expected = "<a class='markdown-tag-link' data-tag='lorem'>#lorem</a> <a class='markdown-tag-link' data-tag='ipsum'>#ipsum</a> <a class='markdown-tag-link' data-tag='dolor'>#dolor</a> \n <a class='markdown-tag-link' data-tag='Sit'>#Sit</a> amet";
    expect(replaceTags(input)).to.equal(expected);

  });
});


describe('Mark Down -> Html', function () {
  it('Should convert mark down to html as expected', function () {

    expect(markDown2Html('foo').trim()).to.equal('<p>foo</p>');

    const dataDir = './test-data/markdown-2-html';
    let files = fs.readdirSync(dataDir);


    for (let file of files) {
      const fileContents = fs.readFileSync(path.join(dataDir, file), 'utf8');
      const testData = fileContents.split("\n----------\n");
      const input = testData[1];
      const expected = testData[2];
      expect(markDown2Html(input)).to.equal(expected);
    }


  })
});
