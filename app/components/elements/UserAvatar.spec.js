/* eslint-disable */
import { spy } from 'sinon';
import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import UserAvatar from './UserAvatar';

Enzyme.configure({ adapter: new Adapter() });

describe('UserAvatar', () => {
  it('(1) Should render small size', () => {
    const props = { user: 'good-karma', size: 'small' };
    const component = shallow(<UserAvatar {...props} />);
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('(2) Should render normal size', () => {
    const props = { user: 'good-karma', size: 'normal' };
    const component = shallow(<UserAvatar {...props} />);
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('(3) Should render medium size', () => {
    const props = { user: 'good-karma', size: 'medium' };
    const component = shallow(<UserAvatar {...props} />);
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('(4) Should render large size', () => {
    const props = { user: 'good-karma', size: 'large' };
    const component = shallow(<UserAvatar {...props} />);
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('(5) Should render xlarge size', () => {
    const props = { user: 'good-karma', size: 'xLarge' };
    const component = shallow(<UserAvatar {...props} />);
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
