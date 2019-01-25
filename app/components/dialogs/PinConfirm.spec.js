/* eslint-disable */

import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import PinConfirm from './PinConfirm';
import { mountWithIntl } from '../../helpers/intl-test';
import PropTypes from 'prop-types';

Enzyme.configure({ adapter: new Adapter() });

describe('PinConfirm', () => {
  it('(1) Render', () => {
    const props = {
      onSuccess: () => {},
      invalidateFn: () => {},
      actions: {
        wipePin: () => {},
        logOut: () => {},
        deleteAccounts: () => {}
      },
      compareHash: 'foo',
      history: {}
    };

    const wrapper = mountWithIntl(<PinConfirm {...props} />);

    expect(wrapper.html()).toMatchSnapshot();
  });
});
