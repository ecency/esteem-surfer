/* eslint-disable */

import proxifyImageSrc from './proxify-image-src';

describe('Proxify image src', () => {
  it('(1) should proxify image src', () => {
    const input = `https://i.imgur.com/muESb0B.png`;

    expect(proxifyImageSrc(input)).toMatchSnapshot();
  });

  it('(2) should not proxify if already proxified', () => {
    const input = `https://steemitimages.com/0x0/https://steemitimages.com/DQmWK9ACVoywHPBJQdoTuJpoTSoaubBSKSAdZaJtw1cfLb9/adsactlywitness.gif`;

    expect(proxifyImageSrc(input)).toMatchSnapshot();
  });
});
