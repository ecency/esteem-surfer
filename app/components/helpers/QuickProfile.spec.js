/* eslint-disable */

import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import QuickProfile from './QuickProfile';
import { mountWithIntl } from '../../helpers/intl-test';
import PropTypes from 'prop-types';

Enzyme.configure({ adapter: new Adapter() });

describe('PinCreate', () => {
  it('(1) Render', () => {
    const props = {
      username: 'foo',
      reputation: '123123123',
      history: {},
      global: {
        theme: 'day'
      }
    };

    const wrapper = mountWithIntl(
      <QuickProfile {...props}>
        <span>click</span>
      </QuickProfile>
    );

    expect(wrapper.html()).toMatchSnapshot();
  });
});
