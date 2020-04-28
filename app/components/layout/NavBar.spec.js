/* eslint-disable */
import { spy } from 'sinon';
import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Dropdown as RealDropDown, Menu } from 'antd';
import renderer from 'react-test-renderer';
import { checkPathForBack } from './NavBar';

Enzyme.configure({ adapter: new Adapter() });

describe('NavBar', () => {
  it('checkPathForBack', () => {
    expect(checkPathForBack('/')).toBe(false);
  });
});
