/* eslint-disable */
import { spy } from 'sinon';
import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import PayoutInfo from './PayoutInfo';

Enzyme.configure({ adapter: new Adapter() });

describe('Payout info component', () => {
  it('should match exact snapshot', () => {
    const props = {
      entry: {
        pending_payout_value: '430.124 SBD',
        promoted: '0.000 SBD',
        total_payout_value: '0.000 SBD',
        curator_payout_value: '0.000 SBD',
        last_payout: '1970-01-01T00:00:00',
        cashout_time: '2018-09-18T12:30:42'
      }
    };

    const component = shallow(
      <PayoutInfo {...props}>
        <a className="post-total">$ 430.12</a>
      </PayoutInfo>
    );
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
