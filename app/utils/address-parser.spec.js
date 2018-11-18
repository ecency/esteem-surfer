/* eslint-disable */

import addressParser from './address-parser';

describe('Address parser', () => {
  it('filter', () => {
    const input = `/trending`;
    expect(addressParser(input)).toMatchSnapshot();
  });

  it('filter + tag', () => {
    const input = `/trending/esteem`;
    expect(addressParser(input)).toMatchSnapshot();
  });

  it('author', () => {
    const input = `/@good-karma`;
    expect(addressParser(input)).toMatchSnapshot();
  });

  it('author + section', () => {
    const input = `/@good-karma/blog`;
    expect(addressParser(input)).toMatchSnapshot();
  });

  it('author + section', () => {
    const input = `/@good-karma/comments`;
    expect(addressParser(input)).toMatchSnapshot();
  });

  it('author + section', () => {
    const input = `/@good-karma/replies`;
    expect(addressParser(input)).toMatchSnapshot();
  });

  it('author + section', () => {
    const input = `/@good-karma/wallet`;
    expect(addressParser(input)).toMatchSnapshot();
  });

  it('author + section', () => {
    const input = `/@good-karma/feed`;
    expect(addressParser(input)).toMatchSnapshot();
  });

  it('post', () => {
    const input = `https://steemit.com/esteem/@good-karma/esteem-search-is-now-opensource-hivemind-plugin-58f8a8bad0598est`;
    expect(addressParser(input)).toMatchSnapshot();
  });

  it('post', () => {
    const input = `/@good-karma/esteem-search-is-now-opensource-hivemind-plugin-58f8a8bad0598est`;
    expect(addressParser(input)).toMatchSnapshot();
  });
});
