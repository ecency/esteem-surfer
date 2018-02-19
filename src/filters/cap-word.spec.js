import {capWord} from './cap-word';
import {expect} from "chai";


describe('Capitalize word', function () {
  it('It should capitalize', function () {
    expect(capWord('hello')).to.equal('Hello');
  });

  it('Should trim', function () {
    expect(capWord('foo ')).to.equal('Foo');
    expect(capWord(' ')).to.equal('');
  });

  it('Should capitalize only first letter if a sentence given', function () {
    expect(capWord('lorem ipsum dolor sit')).to.equal('Lorem ipsum dolor sit');
  });

  it('Should return argument given if it has no value(empty string, undefined, null)', function () {
    expect(capWord('')).to.equal('');
    expect(capWord(undefined)).to.equal(undefined);
    expect(capWord(null)).to.equal(null);
  });
});
