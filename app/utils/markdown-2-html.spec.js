/* eslint-disable */

import markDown2Html, { linkify, sanitizeNode } from './markdown-2-html';

const fs = require('fs');
const path = require('path');

describe('Markdown to Html', () => {
  describe('Replace Author Names', () => {
    it('Should replace author names with link for given string', () => {
      let input = 'lorem ipsum @dolor sit amet';
      let expected =
        'lorem ipsum <a class="markdown-author-link" data-author="dolor">@dolor</a> sit amet';
      expect(linkify(input)).toBe(expected);

      input = '@lorem ipsum @dolor sit amet';
      expected =
        '<a class="markdown-author-link" data-author="lorem">@lorem</a> ipsum <a class="markdown-author-link" data-author="dolor">@dolor</a> sit amet';
      expect(linkify(input)).toBe(expected);

      input = '@lorem @ipsum @dolor sit amet';
      expected =
        '<a class="markdown-author-link" data-author="lorem">@lorem</a> <a class="markdown-author-link" data-author="ipsum">@ipsum</a> <a class="markdown-author-link" data-author="dolor">@dolor</a> sit amet';
      expect(linkify(input)).toBe(expected);

      input = '@lorem @ipsum @dolor \n @sit amet';
      expected =
        '<a class="markdown-author-link" data-author="lorem">@lorem</a> <a class="markdown-author-link" data-author="ipsum">@ipsum</a> <a class="markdown-author-link" data-author="dolor">@dolor</a> \n <a class="markdown-author-link" data-author="sit">@sit</a> amet';
      expect(linkify(input)).toBe(expected);

      input = '@lorem @ipsum @dolor \n @Sit amet';
      expected =
        '<a class="markdown-author-link" data-author="lorem">@lorem</a> <a class="markdown-author-link" data-author="ipsum">@ipsum</a> <a class="markdown-author-link" data-author="dolor">@dolor</a> \n <a class="markdown-author-link" data-author="sit">@Sit</a> amet';
      expect(linkify(input)).toBe(expected);
    });
  });

  describe('Replace Tags', () => {
    it('Should replace tags with link for given string', () => {
      let input = 'lorem ipsum #dolor sit amet';
      let expected =
        'lorem ipsum <a class="markdown-tag-link" data-tag="dolor">#dolor</a> sit amet';
      expect(linkify(input)).toBe(expected);

      input = '#lorem ipsum #dolor sit amet';
      expected =
        '<a class="markdown-tag-link" data-tag="lorem">#lorem</a> ipsum <a class="markdown-tag-link" data-tag="dolor">#dolor</a> sit amet';
      expect(linkify(input)).toBe(expected);

      input = '#lorem #ipsum #dolor sit amet';
      expected =
        '<a class="markdown-tag-link" data-tag="lorem">#lorem</a> <a class="markdown-tag-link" data-tag="ipsum">#ipsum</a> <a class="markdown-tag-link" data-tag="dolor">#dolor</a> sit amet';
      expect(linkify(input)).toBe(expected);

      input = '#lorem #ipsum #dolor \n #sit amet';
      expected =
        '<a class="markdown-tag-link" data-tag="lorem">#lorem</a> <a class="markdown-tag-link" data-tag="ipsum">#ipsum</a> <a class="markdown-tag-link" data-tag="dolor">#dolor</a> \n <a class="markdown-tag-link" data-tag="sit">#sit</a> amet';
      expect(linkify(input)).toBe(expected);

      input = '#lorem #ipsum #dolor \n #Sit amet';
      expected =
        '<a class="markdown-tag-link" data-tag="lorem">#lorem</a> <a class="markdown-tag-link" data-tag="ipsum">#ipsum</a> <a class="markdown-tag-link" data-tag="dolor">#dolor</a> \n <a class="markdown-tag-link" data-tag="sit">#Sit</a> amet';
      expect(linkify(input)).toBe(expected);

      input = 'you are #1';
      expected = 'you are #1';
      expect(linkify(input)).toBe(expected);

      input = 'you are #1 #steemit-promo';
      expected =
        'you are #1 <a class="markdown-tag-link" data-tag="steemit-promo">#steemit-promo</a>';
      expect(linkify(input)).toBe(expected);
    });
  });

  describe('Replace Both Mentions and Tags', () => {
    it('Should replace', () => {
      let input = 'lorem ipsum #dolor sit @amet';
      let expected =
        'lorem ipsum <a class="markdown-tag-link" data-tag="dolor">#dolor</a> sit <a class="markdown-author-link" data-author="amet">@amet</a>';
      expect(linkify(input)).toBe(expected);

      input = 'lorem ipsum @#dolor sit amet';
      expected = 'lorem ipsum @#dolor sit amet';
      expect(linkify(input)).toBe(expected);
    });
  });

  describe('Sanitize Node', () => {
    it('Should convert not allowed tag to span', () => {
      const input = `<script>document.getElementById('body').remove();</script>`;
      const expected = "<span>document.getElementById('body').remove();</span>";

      const el = document.createElement('div');
      el.innerHTML = input;
      const res = sanitizeNode(el);

      expect(res.innerHTML).toBe(expected);
    });

    it('Should convert not allowed tag to span safely for wrong markup', () => {
      const input = `<script>document.getElementById('body').remove();<script>`;
      const expected =
        "<span>document.getElementById('body').remove();&lt;script&gt;</span>";

      const el = document.createElement('div');
      el.innerHTML = input;
      const res = sanitizeNode(el);

      expect(res.innerHTML).toBe(expected);
    });

    it('Should remove not allowed attributes', () => {
      const input = `<a title="Foo" onclick="document.bar()">Click</a>`;
      const expected = '<a title="Foo">Click</a>';

      const el = document.createElement('div');
      el.innerHTML = input;
      const res = sanitizeNode(el);

      expect(res.innerHTML).toBe(expected);
    });

    it('Should remove javascript links', () => {
      const input = `<a title="Foo" href="javascript:void(0)">Click</a>`;
      const expected = '<a title="Foo">Click</a>';

      const el = document.createElement('div');
      el.innerHTML = input;
      const res = sanitizeNode(el);

      expect(res.innerHTML).toBe(expected);
    });
  });

  describe('Mark Down -> Html', () => {
    expect(markDown2Html('foo').trim()).toBe('<p>foo</p>');
  });

  describe('Mark Down -> Html Legacy', () => {
    const dataDir = `${__dirname}/../../test/data/legacy/markdown-2-html`;
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

      it('ID: ' + id, function() {
        expect(markDown2Html(input)).toBe(expected);
      });
    }
  });
});
