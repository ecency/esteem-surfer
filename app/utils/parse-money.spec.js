/* eslint-disable */

import parseMoney from './parse-money';

describe('parse money', () => {
    it('(1) should parse', () => {
        const input = '18.494 SBD';
        expect(parseMoney(input)).toMatchSnapshot();
    });

    it('(2) should parse', () => {
        const input = '0.000 STEEM';
        expect(parseMoney(input)).toMatchSnapshot();
    });
});
