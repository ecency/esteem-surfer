import {amountFormatCheck, formatStrAmount} from './helper.js';

import {expect} from "chai";


describe('Controller helper', () => {
  it('amountFormatCheck', () => {
    expect(amountFormatCheck('0.001')).to.deep.equal(true);
    expect(amountFormatCheck('1')).to.deep.equal(true);
    expect(amountFormatCheck('102.222')).to.deep.equal(true);
    expect(amountFormatCheck('0.1')).to.deep.equal(true);

    expect(amountFormatCheck('0.')).to.deep.equal(false);
    expect(amountFormatCheck('0.00.')).to.deep.equal(false);
    expect(amountFormatCheck('a1')).to.deep.equal(false);
  });

  it('formatStrAmount', () => {
    expect(formatStrAmount('0.10', 'STEEM')).to.deep.equal('0.100 STEEM');
    expect(formatStrAmount('0.001', 'SBD')).to.deep.equal('0.001 SBD');
    expect(formatStrAmount('1', 'STEEM')).to.deep.equal('1.000 STEEM');
    expect(formatStrAmount('10', 'SBD')).to.deep.equal('10.000 SBD');
    expect(formatStrAmount('2.0', 'SBD')).to.deep.equal('2.000 SBD');
    expect(formatStrAmount('100', 'STEEM')).to.deep.equal('100.000 STEEM');
  });
});
