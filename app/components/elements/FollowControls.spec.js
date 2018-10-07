/* eslint-disable */

import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import FollowControls from './FollowControls';
import { mountWithIntl, shallowWithIntl } from '../../helpers/intl-test';

Enzyme.configure({ adapter: new Adapter() });

describe('FollowControls', () => {
  it('(1) Default render. No active user.', () => {
    const props = {
      global: { pin: '1q2w' },
      activeAccount: null,
      targetUsername: 'bar'
    };
    const wrapper = mountWithIntl(<FollowControls {...props} />);

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('(2) Render with active account', () => {
    const props = {
      global: { pin: '1q2w' },
      activeAccount: { username: 'fooo1' },
      targetUsername: 'bar11'
    };
    const wrapper = mountWithIntl(<FollowControls {...props} />);

    // No following and muted
    wrapper.setState({ fetching: false, following: false, muted: false });
    wrapper.update();

    expect(wrapper.html()).toMatchSnapshot();

    // Following
    wrapper.setState({ fetching: false, following: true, muted: false });
    wrapper.update();

    expect(wrapper.html()).toMatchSnapshot();

    // Muted
    wrapper.setState({ fetching: false, following: false, muted: true });
    wrapper.update();

    expect(wrapper.html()).toMatchSnapshot();
  });
});
