/* eslint-disable */
import { spy } from 'sinon';
import React from 'react';
import { prepareContentVotes, preparePopoverContent } from './VotersInfo';

const test_data_1 = {
  total_payout_value: '0.000 SBD',
  curator_payout_value: '0.000 SBD',
  pending_payout_value: '0.905 SBD',
  active_votes: [
    {
      voter: 'camille1234',
      weight: 37746,
      rshares: '79159998491',
      percent: 10000,
      reputation: '3112527265845',
      time: '2018-09-18T14:26:48'
    },
    {
      voter: 'sift666',
      weight: 4943,
      rshares: '62835135084',
      percent: 10000,
      reputation: '28708716428263',
      time: '2018-09-18T07:48:36'
    },
    {
      voter: 'kiwideb',
      weight: 39674,
      rshares: '320761392333',
      percent: 10000,
      reputation: '49978584980731',
      time: '2018-09-18T07:47:45'
    },
    {
      voter: 'mg-nz',
      weight: 127,
      rshares: 1822802530,
      percent: 10000,
      reputation: '967102003310',
      time: '2018-09-18T07:48:03'
    },
    {
      voter: 'kiwiscanfly',
      weight: 16052,
      rshares: '109182542980',
      percent: 10000,
      reputation: '29393565693170',
      time: '2018-09-18T07:52:54'
    },
    {
      voter: 'froyoempire',
      weight: 2112,
      rshares: '4428400072',
      percent: 10000,
      reputation: '1781222920987',
      time: '2018-09-19T15:15:57'
    },
    {
      voter: 'manorvillemike',
      weight: 5581,
      rshares: '11705317664',
      percent: 3300,
      reputation: '7271743051883',
      time: '2018-09-18T13:28:48'
    },
    {
      voter: 'palikari123',
      weight: 3228,
      rshares: '10830350260',
      percent: 5000,
      reputation: '5552644458720',
      time: '2018-09-18T08:02:24'
    },
    {
      voter: 'magic8ball',
      weight: 24,
      rshares: 54868820,
      percent: 3300,
      reputation: -231320336358,
      time: '2018-09-18T07:43:45'
    },
    {
      voter: 'teamnz',
      weight: 661,
      rshares: '39143612782',
      percent: 10000,
      reputation: '553862099874',
      time: '2018-09-18T07:43:45'
    },
    {
      voter: 'frot',
      weight: 2039,
      rshares: '222520508197',
      percent: 10000,
      reputation: '14611334906698',
      time: '2018-09-18T07:43:51'
    },
    {
      voter: 'rabiagilani',
      weight: 7,
      rshares: 59298464,
      percent: 4000,
      reputation: '769860848613',
      time: '2018-09-18T07:52:12'
    },
    {
      voter: 'forrestwalker',
      weight: 119,
      rshares: 552646703,
      percent: 10000,
      reputation: 6969863,
      time: '2018-09-18T07:57:18'
    }
  ]
};

describe('VotersInfo', () => {
  it('(1) prepareContentVotes', () => {
    expect(prepareContentVotes(test_data_1, 1)).toMatchSnapshot();
  });

  it('(2) preparePopoverContent', () => {
    const votesData = prepareContentVotes(test_data_1, 1);
    expect(preparePopoverContent(votesData, '$')).toMatchSnapshot();
  });
});
