/* eslint-disable */

import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Settings from './Settings';
import { mountWithIntl } from '../../helpers/intl-test';

Enzyme.configure({ adapter: new Adapter() });

describe('Settings', () => {
  it('(1) Render', () => {
    const props = {
      actions: {
        changeCurrency: () => {},
        changeLocale: () => {},
        changePushNotify: () => {},
        changeServer: () => {}
      },
      global: {
        currency: 'usd',
        locale: 'en-US',
        server: 'https://api.steemit.com',
        pushNotify: 1
      }
    };

    const wrapper = mountWithIntl(
      <div>
        <Settings {...props} />
      </div>
    );
    expect(wrapper.html()).toMatchSnapshot();
  });
});
