/* eslint-disable */

import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import EntryReblogBtn from './EntryReblogBtn';
import { mountWithIntl } from '../../helpers/intl-test';

Enzyme.configure({ adapter: new Adapter() });

describe('EntryReblogBtn', () => {
  it('(1) Render', () => {
    const props = {
      global: {},
      entry: {
        author: 'foo',
        permlink: 'bar-baz'
      }
    };
    const wrapper = mountWithIntl(<EntryReblogBtn {...props} />);
    expect(wrapper.html()).toMatchSnapshot();
  });
});
