/* eslint-disable */

import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { getTestData } from '../../../test/data';
import { prepareVotes } from './EntryVotes';
import EntryVotesContent from './EntryVotesContent';
import { mountWithIntl } from '../../helpers/intl-test';

Enzyme.configure({ adapter: new Adapter() });

describe('EntryVoters', () => {
  it('(1) Should render list prepared top 10 votes. Should show more text at bottom.', () => {
    const testData = getTestData(
      'esteemapp',
      'meet-our-cmo-and-product-lead-fil-dunsky-db1db689675c5est'
    );
    const votes = prepareVotes(testData, 1);

    const props = {
      votes: votes,
      global: { currencyRate: 1, currencySymbol: '$' }
    };
    const wrapper = mountWithIntl(<EntryVotesContent {...props} />);
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('(2) Should not show more text at bottom. ', () => {
    const testData = getTestData('talhasch', 'one-more-test');
    const votes = prepareVotes(testData, 1);

    const props = {
      votes: votes,
      global: { currencyRate: 1, currencySymbol: '$' }
    };
    const wrapper = mountWithIntl(<EntryVotesContent {...props} />);
    expect(wrapper.html()).toMatchSnapshot();
  });
});
