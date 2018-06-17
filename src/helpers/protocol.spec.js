import {protocolUrl2Obj} from './protocol';
import {expect} from "chai";

describe('Protocol url to object', () => {
  it('protocolUrl2Obj post 1', () => {
    const input = `steem://esteem/@good-karma/esteem-surfer-1-0-3-update-comment-encryption-delegation-reader-view-72f47edf4a025`;
    const expected = {
      type: 'post',
      cat: 'esteem',
      author: 'good-karma',
      permlink: 'esteem-surfer-1-0-3-update-comment-encryption-delegation-reader-view-72f47edf4a025'
    };
    expect(protocolUrl2Obj(input)).to.deep.equal(expected);
  });

  it('protocolUrl2Obj post 2', () => {
    const input = `esteem://esteem/@esteemapp/esteem-surfer-tips-4-voting-perentage-87f0ebb67ae0e/`;
    const expected = {
      type: 'post',
      cat: 'esteem',
      author: 'esteemapp',
      permlink: 'esteem-surfer-tips-4-voting-perentage-87f0ebb67ae0e'
    };
    expect(protocolUrl2Obj(input)).to.deep.equal(expected);
  });

  it('protocolUrl2Obj account 1', () => {
    const input = `steem://@good-karma`;
    const expected = {
      type: 'account',
      account: 'good-karma',
    };
    expect(protocolUrl2Obj(input)).to.deep.equal(expected);
  });

  it('protocolUrl2Obj account 2', () => {
    const input = `esteem://@talhasch/`;
    const expected = {
      type: 'account',
      account: 'talhasch',
    };
    expect(protocolUrl2Obj(input)).to.deep.equal(expected);
  });

  it('protocolUrl2Obj filter', () => {
    const input = `steem://trending`;
    const expected = {
      type: 'filter',
      filter: 'trending',
    };
    expect(protocolUrl2Obj(input)).to.deep.equal(expected);
  });

  it('protocolUrl2Obj filter with tag', () => {
    const input = `esteem://trending/esteem`;
    const expected = {
      type: 'filter-tag',
      filter: 'trending',
      tag: 'esteem'
    };
    expect(protocolUrl2Obj(input)).to.deep.equal(expected);
  });

  it('should return undefined', () => {
    const input = `steem://foobarbaz`;
    const expected = undefined;
    expect(protocolUrl2Obj(input)).to.deep.equal(expected);
  });
});
