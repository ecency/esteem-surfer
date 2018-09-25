/* eslint-disable */
import { spy } from 'sinon';
import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import Mi from './Mi';

Enzyme.configure({ adapter: new Adapter() });

function setup() {
  const props = {
    icon: 'code'
  };
  const component = shallow(<Mi {...props} />);
  return {
    component,
    props
  };
}

describe('Material icon component', () => {
  it('should display icon', () => {
    const { component, props } = setup();
    expect(component.text()).toBe(props.icon);
  });

  it('should match exact snapshot', () => {
    const { props } = setup();
    const mi = (
      <div>
        <Mi {...props} />
      </div>
    );
    const tree = renderer.create(mi).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
