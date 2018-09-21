/* eslint-disable */

import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { getTestData } from '../../../test/data';
import EntryPayoutContent from './EntryPayoutContent';
import { mountWithIntl } from '../../helpers/intl-test';

Enzyme.configure({ adapter: new Adapter() });

describe('EntryPayoutContent', () => {
  it('(1) Should render list prepared top 10 votes. Should show more text at bottom.', () => {
    const testData = getTestData(
      'esteemapp',
      'meet-our-cmo-and-product-lead-fil-dunsky-db1db689675c5est'
    );

    const props = {
      entry: testData,
      global: { currencyRate: 1, currencySymbol: '$' }
    };
    const wrapper = mountWithIntl(<EntryPayoutContent {...props} />);
    console.log(wrapper.html());
    // expect(wrapper.html()).toMatchSnapshot();
  });
});
