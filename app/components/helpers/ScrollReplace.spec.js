/* eslint-disable */
import { spy } from 'sinon';
import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import ScrollReplace from './ScrollReplace';

Enzyme.configure({ adapter: new Adapter() });

describe('ScrollReplace', () => {
  it('(1) Render', () => {
    const props = {
      location: { pathname: '/' },
      history: { action: 'PUSH' },
      selector: '#app-content'
    };
    const component = shallow(<ScrollReplace {...props} />);
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
