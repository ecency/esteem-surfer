import {extractMetadata, createPermlink} from './editor.js';

import {expect} from "chai";


describe('Editor Controller', () => {
  it('createPermlink', () => {
    const input = 'Suspendisse augue risus, scelerisque fringilla purus id, lacinia faucibus nibh. Suspendisse in est ligula. Ut vitae nunc velit. Ut ac volutpat magna. Nam ultricies id mi eu auctor. Etiam ligula velit, iaculis ornare hendrerit non, rhoncus non felis. Donec tristique odio sed aliquam ornare.';
    const res = createPermlink(input);
    expect(res.endsWith('est')).to.deep.equal(true);
    expect(res.length).to.deep.equal(255);
  });

  it('extractMetadata 1', () => {
    const body = '';
    const res = extractMetadata(body);
    expect(res).to.deep.equal({});
  });

  it('extractMetadata 2', () => {
    const body = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum vitae pharetra mi.';
    const res = extractMetadata(body);
    expect(res).to.deep.equal({});
  });

  it('extractMetadata 3', () => {
    const body = 'Lorem @ipsum dolor sit @amet';
    const res = extractMetadata(body);
    expect(res['users'].indexOf('ipsum') > -1).to.deep.equal(true);
    expect(res['users'].indexOf('amet') > -1).to.deep.equal(true);
    expect(res['users']['links']).to.deep.equal(undefined);
    expect(res['users']['image']).to.deep.equal(undefined);
  });

  it('extractMetadata 4', () => {
    const body = 'Lorem @ipsum dolor sit @amet Nulla eget elit nec nisl https://mattis.com/foo/bar/baz';
    const res = extractMetadata(body);
    expect(res['users'].indexOf('ipsum') > -1).to.deep.equal(true);
    expect(res['users'].indexOf('amet') > -1).to.deep.equal(true);
    expect(res['links'].indexOf('https://mattis.com/foo/bar/baz') > -1).to.deep.equal(true);
    expect(res['users']['image']).to.deep.equal(undefined);
  });


  it('extractMetadata 5', () => {
    const body = 'Lorem @ipsum dolor sit @amet Nulla eget elit nec nisl https://mattis.com/foo/bar/baz Mauris http://google.com/foo/bar/xx.html ';
    const res = extractMetadata(body);
    expect(res['users'].indexOf('ipsum') > -1).to.deep.equal(true);
    expect(res['users'].indexOf('amet') > -1).to.deep.equal(true);
    expect(res['links'].indexOf('https://mattis.com/foo/bar/baz') > -1).to.deep.equal(true);
    expect(res['links'].indexOf('http://google.com/foo/bar/xx.html') > -1).to.deep.equal(true);
    expect(res['users']['image']).to.deep.equal(undefined);
  });

  it('extractMetadata 6', () => {
    const body = 'Lorem @ipsum dolor sit @amet Nulla eget elit nec nisl https://mattis.com/foo/bar/baz Mauris http://google.com/foo/bar/xx.html sit amet https://imgur.com/path/12dsvg23.png ';
    const res = extractMetadata(body);
    expect(res['users'].indexOf('ipsum') > -1).to.deep.equal(true);
    expect(res['users'].indexOf('amet') > -1).to.deep.equal(true);
    expect(res['links'].indexOf('https://mattis.com/foo/bar/baz') > -1).to.deep.equal(true);
    expect(res['links'].indexOf('http://google.com/foo/bar/xx.html') > -1).to.deep.equal(true);
    expect(res['image'].indexOf('https://imgur.com/path/12dsvg23.png') > -1).to.deep.equal(true);
  });

  it('extractMetadata 6', () => {
    const body = 'Lorem @ipsum dolor sit @amet Nulla eget elit nec nisl https://mattis.com/foo/bar/baz Mauris http://google.com/foo/bar/xx.html sit amet https://imgur.com/path/12dsvg23.png ornare neque quis blandit lobortis https://mattis.com/foo/bar/baz.jpg ';
    const res = extractMetadata(body);
    expect(res['users'].indexOf('ipsum') > -1).to.deep.equal(true);
    expect(res['users'].indexOf('amet') > -1).to.deep.equal(true);
    expect(res['links'].indexOf('https://mattis.com/foo/bar/baz') > -1).to.deep.equal(true);
    expect(res['links'].indexOf('http://google.com/foo/bar/xx.html') > -1).to.deep.equal(true);
    expect(res['image'].indexOf('https://imgur.com/path/12dsvg23.png') > -1).to.deep.equal(true);
    expect(res['image'].indexOf('https://mattis.com/foo/bar/baz.jpg') > -1).to.deep.equal(true);
  });
});
