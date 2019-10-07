/* eslint-disable */

import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Login from './Login';
import { mountWithIntl } from '../../helpers/intl-test';

Enzyme.configure({ adapter: new Adapter() });

describe('Login', () => {
  it('(1) Default Render', () => {
    const props = {
      actions: {
        addAccount: () => {},
        addAccountSc: () => {},
        logIn: () => {},
        logOut: () => {},
        deleteAccount: () => {},
        updateActiveAccount: () => {}
      },
      onSuccess: () => {},
      accounts: []
    };

    const component = mountWithIntl(<Login {...props} />);
    expect(component.html()).toMatchSnapshot();
  });

  it('(3) Render with account list', () => {
    const props = {
      actions: {
        addAccount: () => {},
        addAccountSc: () => {},
        logIn: () => {},
        logOut: () => {},
        deleteAccount: () => {},
        updateActiveAccount: () => {}
      },
      onSuccess: () => {},
      accounts: [
        {
          username: 'foo'
        },
        {
          username: 'bar'
        }
      ]
    };

    const component = mountWithIntl(<Login {...props} />);
    expect(component.html()).toMatchSnapshot();
  });
});
