/* eslint-disable */

import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { getTestData } from '../../../test/data';
import EntryPayoutContent from './EntryPayoutContent';
import { mountWithIntl } from '../../helpers/intl-test';

Enzyme.configure({ adapter: new Adapter() });

describe('EntryPayoutContent', () => {
  jest.spyOn(Date, 'now').mockImplementation(() => {
    return new Date('2018-09-21T12:00:50.000Z');
  });

  it('(1) Render not paid out content', () => {
    const testData = getTestData(
      'esteemapp',
      'meet-our-cmo-and-product-lead-fil-dunsky-db1db689675c5est'
    );

    const props = {
      entry: testData,
      global: { currencyRate: 1, currencySymbol: '$' }
    };
    const wrapper = mountWithIntl(<EntryPayoutContent {...props} />);
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('(2) Render paid out content', () => {
    const testData = getTestData(
      'good-karma',
      'esteem-surfer-reimagined-ui-ux-preview-b8fb9bb0872beest'
    );

    const props = {
      entry: testData,
      global: { currencyRate: 1, currencySymbol: '$' }
    };
    const wrapper = mountWithIntl(<EntryPayoutContent {...props} />);
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('(3) Render promoted content', () => {
    const testData = getTestData(
      'fortunejackcom',
      'do-you-actually-know-what-blockchain-is'
    );

    const props = {
      entry: testData,
      global: { currencyRate: 1, currencySymbol: '$' }
    };
    const wrapper = mountWithIntl(<EntryPayoutContent {...props} />);
    expect(wrapper.html()).toMatchSnapshot();
  });
});
