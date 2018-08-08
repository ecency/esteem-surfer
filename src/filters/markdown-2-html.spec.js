import {markDown2Html, linkify} from './markdown-2-html';
import {expect} from "chai";

const path = require('path');

const fs = require('fs');


describe('Replace Author Names', () => {
  it('Should replace author names with link for given string', () => {

    let input = 'lorem ipsum @dolor sit amet';
    let expected = "lorem ipsum <a class=\"markdown-author-link\" data-author=\"dolor\">@dolor</a> sit amet";
    expect(linkify(input)).to.equal(expected);


    input = '@lorem ipsum @dolor sit amet';
    expected = "<a class=\"markdown-author-link\" data-author=\"lorem\">@lorem</a> ipsum <a class=\"markdown-author-link\" data-author=\"dolor\">@dolor</a> sit amet";
    expect(linkify(input)).to.equal(expected);


    input = '@lorem @ipsum @dolor sit amet';
    expected = "<a class=\"markdown-author-link\" data-author=\"lorem\">@lorem</a> <a class=\"markdown-author-link\" data-author=\"ipsum\">@ipsum</a> <a class=\"markdown-author-link\" data-author=\"dolor\">@dolor</a> sit amet";
    expect(linkify(input)).to.equal(expected);


    input = '@lorem @ipsum @dolor \n @sit amet';
    expected = "<a class=\"markdown-author-link\" data-author=\"lorem\">@lorem</a> <a class=\"markdown-author-link\" data-author=\"ipsum\">@ipsum</a> <a class=\"markdown-author-link\" data-author=\"dolor\">@dolor</a> \n <a class=\"markdown-author-link\" data-author=\"sit\">@sit</a> amet";
    expect(linkify(input)).to.equal(expected);


    input = '@lorem @ipsum @dolor \n @Sit amet';
    expected = "<a class=\"markdown-author-link\" data-author=\"lorem\">@lorem</a> <a class=\"markdown-author-link\" data-author=\"ipsum\">@ipsum</a> <a class=\"markdown-author-link\" data-author=\"dolor\">@dolor</a> \n <a class=\"markdown-author-link\" data-author=\"sit\">@Sit</a> amet";
    expect(linkify(input)).to.equal(expected);
  });
});


describe('Replace Tags', () => {
  it('Should replace tags with link for given string', () => {

    let input = 'lorem ipsum #dolor sit amet';
    let expected = "lorem ipsum <a class=\"markdown-tag-link\" data-tag=\"dolor\">#dolor</a> sit amet";
    expect(linkify(input)).to.equal(expected);

    input = '#lorem ipsum #dolor sit amet';
    expected = "<a class=\"markdown-tag-link\" data-tag=\"lorem\">#lorem</a> ipsum <a class=\"markdown-tag-link\" data-tag=\"dolor\">#dolor</a> sit amet";
    expect(linkify(input)).to.equal(expected);

    input = '#lorem #ipsum #dolor sit amet';
    expected = "<a class=\"markdown-tag-link\" data-tag=\"lorem\">#lorem</a> <a class=\"markdown-tag-link\" data-tag=\"ipsum\">#ipsum</a> <a class=\"markdown-tag-link\" data-tag=\"dolor\">#dolor</a> sit amet";
    expect(linkify(input)).to.equal(expected);

    input = '#lorem #ipsum #dolor \n #sit amet';
    expected = "<a class=\"markdown-tag-link\" data-tag=\"lorem\">#lorem</a> <a class=\"markdown-tag-link\" data-tag=\"ipsum\">#ipsum</a> <a class=\"markdown-tag-link\" data-tag=\"dolor\">#dolor</a> \n <a class=\"markdown-tag-link\" data-tag=\"sit\">#sit</a> amet";
    expect(linkify(input)).to.equal(expected);

    input = '#lorem #ipsum #dolor \n #Sit amet';
    expected = "<a class=\"markdown-tag-link\" data-tag=\"lorem\">#lorem</a> <a class=\"markdown-tag-link\" data-tag=\"ipsum\">#ipsum</a> <a class=\"markdown-tag-link\" data-tag=\"dolor\">#dolor</a> \n <a class=\"markdown-tag-link\" data-tag=\"sit\">#Sit</a> amet";
    expect(linkify(input)).to.equal(expected);

    input = 'you are #1';
    expected = "you are #1";
    expect(linkify(input)).to.equal(expected);

    input = 'you are #1 #steemit-promo';
    expected = "you are #1 <a class=\"markdown-tag-link\" data-tag=\"steemit-promo\">#steemit-promo</a>";
    expect(linkify(input)).to.equal(expected);

  });
});


describe('Replace Both Mentions and Tags', () => {
  it('Should replace', () => {

    let input = 'lorem ipsum #dolor sit @amet';
    let expected = "lorem ipsum <a class=\"markdown-tag-link\" data-tag=\"dolor\">#dolor</a> sit <a class=\"markdown-author-link\" data-author=\"amet\">@amet</a>";
    expect(linkify(input)).to.equal(expected);

    input = 'lorem ipsum @#dolor sit amet';
    expected = "lorem ipsum @#dolor sit amet";
    expect(linkify(input)).to.equal(expected);

  });
});


describe('Mark Down -> Html', () => {

  expect(markDown2Html('foo').trim()).to.equal('<p>foo</p>');

  const dataDir = './test-data/markdown-2-html';
  let files = fs.readdirSync(dataDir);

  for (let file of files) {
    if (file === '.DS_Store') {
      continue;
    }
    const fileContents = fs.readFileSync(path.join(dataDir, file), 'utf8');
    let data = JSON.parse(fileContents);

    const id = data['id'];
    const input = data['input'];
    const expected = data['result'];

    it('ID: ' + id, function () {
      expect(markDown2Html(input)).to.equal(expected);
    })
  }
});
