/* eslint-disable */
import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import FormattedCurrency from './FormattedCurrency';

Enzyme.configure({ adapter: new Adapter() });

describe('FormattedCurrency', () => {
  it('(1) render usd', () => {
    const props = {
      global: { currencyRate: 1, currencySymbol: '$' },
      value: 0.155
    };
    const component = shallow(<FormattedCurrency {...props} />);
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('(2) render euro', () => {
    const props = {
      global: { currencyRate: 0.84, currencySymbol: '€' },
      value: 0.155
    };
    const component = shallow(<FormattedCurrency {...props} />);
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('(3) render tl with 4 character after dot', () => {
    const props = {
      global: { currencyRate: 6.3, currencySymbol: '₺' },
      value: 0.155,
      fixAt: 4
    };
    const component = shallow(<FormattedCurrency {...props} />);
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
