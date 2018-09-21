/* eslint-disable */
import React from 'react';
import { getTestData } from '../../../test/data';
import { prepareVotes } from './EntryVotes';

describe('EntryVotes', () => {
  it('(1) Should prepare votes reward descending ordered', () => {
    const testData = getTestData(
      'esteemapp',
      'meet-our-cmo-and-product-lead-fil-dunsky-db1db689675c5est'
    );
    expect(prepareVotes(testData, 1)).toMatchSnapshot();
  });
});
