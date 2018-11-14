/* eslint-disable */

import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {
  AccountMenu,
  AccountCover,
  AccountTopPosts,
  Exchange
} from './Account';
import { mountWithIntl, shallowWithIntl } from '../helpers/intl-test';

Enzyme.configure({ adapter: new Adapter() });

describe('AccountMenu', () => {
  it('Render', () => {
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
});

describe('AccountCover', () => {
  it('Render', () => {
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
});

describe('AccountTopPosts', () => {
  it('Render', () => {
    const props = {
      posts: [
        {
          title: 'Foo bar',
          body: 'lorem ipsum',
          author: 'fooox',
          permlink: 'lorem-ipsum'
        },
        {
          title: 'Baz gaz',
          body: 'dolor sit amet',
          author: 'baazx',
          permlink: 'dolor-sit'
        }
      ],
      history: {},
      actions: {
        setVisitingEntry: () => {}
      }
    };
    const wrapper = mountWithIntl(<AccountTopPosts {...props} />);

    expect(wrapper.html()).toMatchSnapshot();
  });
});

describe('Exchange', () => {
  it('Render raising values', () => {
    const props = {
      marketData: {
        sbd: {
          quotes: {
            btc: {
              last_updated: '2018-10-15T08:39:22.000Z',
              percent_change: 0.8654,
              price: 0.00015030939917398168
            },
            usd: {
              last_updated: '2018-10-15T08:39:29.000Z',
              percent_change: 0.719866,
              price: 0.99741902187
            }
          }
        },
        steem: {
          quotes: {
            btc: {
              last_updated: '2018-10-15T08:39:22.000Z',
              percent_change: 1.0734,
              price: 0.0001246760657740764
            },
            usd: {
              last_updated: '2018-10-15T08:39:29.000Z',
              percent_change: 0.511095,
              price: 0.82732204545
            }
          }
        }
      }
    };
    const wrapper = mountWithIntl(<Exchange {...props} />);
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('Render falling values', () => {
    const props = {
      marketData: {
        sbd: {
          quotes: {
            btc: {
              last_updated: '2018-10-15T08:39:22.000Z',
              percent_change: -0.8654,
              price: 0.00015030939917398168
            },
            usd: {
              last_updated: '2018-10-15T08:39:29.000Z',
              percent_change: -0.719866,
              price: 0.99741902187
            }
          }
        },
        steem: {
          quotes: {
            btc: {
              last_updated: '2018-10-15T08:39:22.000Z',
              percent_change: -1.0734,
              price: 0.0001246760657740764
            },
            usd: {
              last_updated: '2018-10-15T08:39:29.000Z',
              percent_change: -0.511095,
              price: 0.82732204545
            }
          }
        }
      }
    };
    const wrapper = mountWithIntl(<Exchange {...props} />);
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('Render same values', () => {
    const props = {
      marketData: {
        sbd: {
          quotes: {
            btc: {
              last_updated: '2018-10-15T08:39:22.000Z',
              percent_change: 0.0,
              price: 0.00015030939917398168
            },
            usd: {
              last_updated: '2018-10-15T08:39:29.000Z',
              percent_change: 0.0,
              price: 0.99741902187
            }
          }
        },
        steem: {
          quotes: {
            btc: {
              last_updated: '2018-10-15T08:39:22.000Z',
              percent_change: 0.0,
              price: 0.0001246760657740764
            },
            usd: {
              last_updated: '2018-10-15T08:39:29.000Z',
              percent_change: 0.0,
              price: 0.82732204545
            }
          }
        }
      }
    };
    const wrapper = mountWithIntl(<Exchange {...props} />);
    expect(wrapper.html()).toMatchSnapshot();
  });
});
