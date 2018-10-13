/* eslint-disable */

import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { AccountMenu, AccountCover, AccountTopPosts } from './Account';
import { mountWithIntl, shallowWithIntl } from '../helpers/intl-test';

Enzyme.configure({ adapter: new Adapter() });

describe('Account', () => {
  it('(1) AccountMenu render', () => {
    const props = {
      username: 'foo',
      section: 'comments',
      history: {},
      global: {
        listStyle: 'row'
      },
      actions: {
        changeListStyle: () => {}
      }
    };
    const wrapper = mountWithIntl(<AccountMenu {...props} />);

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('(2) AccountCover render', () => {
    const props = {
      username: 'foo',
      account: {
        accountProfile: {
          cover_image: 'https://foo.bar/baz.png'
        }
      },
      global: {
        theme: 'day'
      }
    };
    const wrapper = mountWithIntl(<AccountCover {...props} />);

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('(3) AccountTopPosts render', () => {
    const props = {
      posts: [
        {
          title: 'Foo bar',
          body: 'lorem ipsum',
          permlink: 'lorem-ipsum'
        },
        {
          title: 'Baz gaz',
          body: 'dolor sit amet',
          permlink: 'dolor-sit'
        }
      ]
    };
    const wrapper = mountWithIntl(<AccountTopPosts {...props} />);

    expect(wrapper.html()).toMatchSnapshot();
  });
});
