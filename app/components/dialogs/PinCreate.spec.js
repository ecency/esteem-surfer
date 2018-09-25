/* eslint-disable */

import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import PinCreate from './PinCreate';
import { mountWithIntl } from '../../helpers/intl-test';

Enzyme.configure({ adapter: new Adapter() });

describe('PinCreate', () => {
  it('(1) Render', () => {
    const props = {
      actions: {
        exposePin: () => {},
        wipePin: () => {}
      }
    };

    const wrapper = mountWithIntl(
      <div>
        <PinCreate {...props} />
      </div>
    );
    expect(wrapper.html()).toMatchSnapshot();
  });
});
