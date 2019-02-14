/* eslint-disable */

import markDown2Html, { linkify, sanitizeNode } from './markdown-2-html';
import { getTestData } from '../../test/data';
import addressParser from './address-parser';

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
    it('Should convert markdown to html', () => {
      expect(markDown2Html('foo').trim()).toBe('<p>foo</p>');
    });
  });

  describe('Mark Down -> Html', () => {
    it('Should catch images in table', () => {
      const data = getTestData(
        'steemitboard',
        'steemitboard-notify-dunsky-20181210t153450000z'
      );
      expect(markDown2Html(data.body)).toMatchSnapshot();
    });
  });

  describe('Mark Down -> Html', () => {
    it('Should add https prefix', () => {
      expect(markDown2Html('<a href="foo">foo</a>').trim()).toBe(
        '<p><a class="markdown-external-link" data-href="https://foo">foo</a></p>'
      );
    });
  });

  describe('Mark Down -> Html', () => {
    it('Should replace busy links properly', () => {
      const data = getTestData(
        'muratkbesiroglu',
        'sci-fi-novel-underground-city-part-13'
      );
      expect(markDown2Html(data.body)).toMatchSnapshot();
    });
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

  describe('Mark Down -> Html', () => {
    it('Should not convert markdown links', () => {
      const input =
        'lorem [this error](https://steemitimages.com/0x0/https://d1vof77qrk4l5q.cloudfront.net/img/5752638e6965247789bc20cef34727263aaa41e1.png) ipsum';
      expect(markDown2Html(input)).toMatchSnapshot();
    });
  });
});
