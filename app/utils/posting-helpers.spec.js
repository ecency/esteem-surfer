/* eslint-disable */
import {
  createPermlink,
  makeOptions,
  extractMetadata,
  makeJsonMetadata,
  createReplyPermlink,
  makeJsonMetadataReply,
  createPatch
} from './posting-helpers';
import { Select } from 'antd/lib/select';
import React from 'react';

describe('createPermlink', () => {
  it('(1) ', () => {
    const input = 'lorem ipsum dolor sit amet';
    expect(createPermlink(input)).toMatchSnapshot();
  });
});

describe('createPermlink random', () => {
  jest.spyOn(Math, 'random').mockImplementation(() => {
    return 1.95136022969379;
  });

  it('(1) ', () => {
    const input = 'lorem ipsum dolor sit amet';
    expect(createPermlink(input, true)).toMatchSnapshot();
  });
});

describe('createPermlink non-latin chars', () => {
  jest.spyOn(Math, 'random').mockImplementation(() => {
    return 1.95136022969379;
  });

  it('(1) ', () => {
    const input = 'ปลาตัวใหญ่สีเหลืองทอง';
    expect(createPermlink(input)).toMatchSnapshot();
  });
});

describe('makeOptions', () => {
  it('(1) Default 50% / 50%', () => {
    expect(
      makeOptions('talhasch', 'lorem-ipsum-1', 'default')
    ).toMatchSnapshot();
  });

  it('(2) Power Up 100%', () => {
    expect(makeOptions('talhasch', 'lorem-ipsum-1', 'sp')).toMatchSnapshot();
  });

  it('(3) Decline Payout', () => {
    expect(makeOptions('talhasch', 'lorem-ipsum-1', 'dp')).toMatchSnapshot();
  });
});

describe('extractMetadata', () => {
  it('(1) ', () => {
    const input = '<img src="http://www.xx.com/a.png"> @lorem @ipsum';
    expect(extractMetadata(input)).toMatchSnapshot();
  });

  it('(2) ', () => {
    const input =
      '@lorem <img src="http://www.xx.com/a.png"> ![h74zrad2fh.jpg](https://img.esteem.ws/h74zrad2fh.jpg) http://www.google.com/foo/bar  @ipsum';
    expect(extractMetadata(input)).toMatchSnapshot();
  });
});

describe('makeJsonMetadata', () => {
  it('(1) ', () => {
    const meta = {
      image: [
        'http://www.xx.com/a.png',
        'https://img.esteem.ws/h74zrad2fh.jpg'
      ],
      links: ['http://www.google.com/foo/bar'],
      users: ['lorem', 'ipsum']
    };
    const tags = ['esteem', 'art'];

    expect(makeJsonMetadata(meta, tags, '2.0.0')).toMatchSnapshot();
  });
});

describe('makeJsonMetadataReply', () => {
  it('(1)', () => {
    expect(makeJsonMetadataReply(['foo', 'bar'])).toMatchSnapshot();
  });
});

describe('createReplyPermlink', () => {
  jest.spyOn(Date, 'now').mockImplementation(() => {
    return new Date('2018-09-21T12:00:50.000Z');
  });

  it('(1) ', () => {
    expect(createReplyPermlink('good-karma')).toMatchSnapshot();
  });
});

describe('createPatch', () => {
  it('(1) ', () => {
    expect(
      createPatch('lorem ipsum dlor sit amet', 'lorem ipsum dolor sit amet')
    ).toMatchSnapshot();
  });
});
