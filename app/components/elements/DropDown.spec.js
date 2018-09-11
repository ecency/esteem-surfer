/* eslint-disable */
import { spy } from 'sinon';
import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import DropDown from './DropDown';

import { Dropdown as RealDropDown, Menu } from 'antd';
import renderer from 'react-test-renderer';

Enzyme.configure({ adapter: new Adapter() });

function setup() {
  const props = {
    menu: (
      <Menu selectedKeys={1}>
        <Menu.Item key="1">
          <a href="#">Item 1</a>
        </Menu.Item>
        <Menu.Item key="2">
          <a href="#">Item 2</a>
        </Menu.Item>
        <Menu.Item key="3">
          <a href="#">Item 3</a>
        </Menu.Item>
      </Menu>
    ),
    location: {}
  };
  const component = shallow(<DropDown {...props} />);
  return {
    component,
    props,
    menu: component.first()
  };
}

describe('DropDown element', () => {
  it('(1) first element should be ants drop down', () => {
    const { menu } = setup();
    expect(menu.type()).toBe(RealDropDown);
  });

  it('hover should be false by default', () => {
    const { component } = setup();
    expect(component.state('hover')).toBe(false);
  });

  it('(2) state and caret class should be changed when onVisibleChange(true) triggered by antd drop down', () => {
    const { component, menu } = setup();
    menu.prop('onVisibleChange')(true);
    expect(component.state('hover')).toBe(true);
    component.update();
    let caret = component.find('span');
    expect(caret.hasClass('hover')).toBe(true);

    menu.prop('onVisibleChange')(false);
    expect(component.state('hover')).toBe(false);
    component.update();
    caret = component.find('span');
    expect(caret.hasClass('hover')).toBe(false);
  });

  it('(3) state and caret class should changed when location prop changed', () => {
    const { component, menu } = setup();
    menu.prop('onVisibleChange')(true);
    expect(component.state('hover')).toBe(true);
    component.update();
    let caret = component.find('span');
    expect(caret.hasClass('hover')).toBe(true);

    component.setProps({ location: { path: 'foo' } });

    setTimeout(() => {
      expect(component.state('hover')).toBe(false);
      component.update();
      caret = component.find('span');
      expect(caret.hasClass('hover')).toBe(false);
    }, 400);
  });
});
