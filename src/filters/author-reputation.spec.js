import {authorReputation} from './author-reputation';
import {expect} from "chai";


describe('Author Reputation', () => {
  it('Should convert raw author reputation', () => {

    let input = 253948750399663;
    let expected = 73;
    expect(authorReputation(input)).to.equal(expected);

    input = 258273053764877;
    expected = 73;
    expect(authorReputation(input)).to.equal(expected);

    input = 8015808359006;
    expected = 60;
    expect(authorReputation(input)).to.equal(expected);

    input = 1661224045060;
    expected = 53;
    expect(authorReputation(input)).to.equal(expected);

    input = 51140617022287;
    expected = 67;
    expect(authorReputation(input)).to.equal(expected);

    input = 268491430682952;
    expected = 73;
    expect(authorReputation(input)).to.equal(expected);

    input = -54158579309067;
    expected = -18;
    expect(authorReputation(input)).to.equal(expected);

    input = 11964041002;
    expected = 34;
    expect(authorReputation(input)).to.equal(expected);

    input = 945546552;
    expected = 25;
    expect(authorReputation(input)).to.equal(expected);

    input = undefined;
    expected = undefined;
    expect(authorReputation(input)).to.equal(expected);

    input = 0;
    expected = 25;
    expect(authorReputation(input)).to.equal(expected);

    input = 533215985;
    expected = 25;
    expect(authorReputation(input)).to.equal(expected);

    input = 39508828392;
    expected = 39;
    expect(authorReputation(input)).to.equal(expected);

    input = 352800518860;
    expected = 47;
    expect(authorReputation(input)).to.equal(expected);

    input = 6702887567;
    expected = 32;
    expect(authorReputation(input)).to.equal(expected);

    input = '';
    expected = '';
    expect(authorReputation(input)).to.equal(expected);
  });
});
