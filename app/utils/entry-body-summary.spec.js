/* eslint-disable */
import entryBodySummary from './entry-body-summary';

describe('Entry Body Summary', () => {
  it('(1) Should return empty string', () => {
    let input = '';
    expect(entryBodySummary(input)).toMatchSnapshot();
  });

  it('(2) Should remove html tags', () => {
    let input = '<center>Lorem Ipsum Dolor</center>';
    expect(entryBodySummary(input)).toMatchSnapshot();
  });

  it('(3) Should remove new lines', () => {
    let input = 'Lorem \n Ipsum \n Dolor';
    expect(entryBodySummary(input)).toMatchSnapshot();
  });

  it('(4) Should trim', () => {
    let input = '   Lorem Ipsum Dolor     ';
    expect(entryBodySummary(input)).toMatchSnapshot();
  });

  it('(5) Should remove urls', () => {
    let input = 'Lorem http://lorem.com Ipsum Dolor https://ipsum.com';
    expect(entryBodySummary(input)).toMatchSnapshot();
  });

  it('(6) Should remove white spaces between words', () => {
    let input = '   Lorem       Ipsum      Dolor     ';
    expect(entryBodySummary(input)).toMatchSnapshot();
  });

  it('(7) Should limit to 20', () => {
    let input = 'lorem ipsum dolor sit amet';
    expect(entryBodySummary(input, 20)).toMatchSnapshot();
  });

  it('(8) Test with long markdown', () => {
    let input = `https://youtu.be/DII2VTXDP7A
In this post, we want to bring you up to speed on what is happening inside Steemit, as well as give you our perspective on the successes (and failures) of the past year, let you know what we see as our mission going forward, and provide some insight into what we have planned.
<h1>Steemit’s Vision and Mission</h1>
Through our vision of **empowering entrepreneurs to tokenize the internet**, our primary roles in the Steem ecosystem are providing the community with software enhancements to the Steem blockchain, modular framework applications made up of components that can be leveraged by application developers and inspiration through these platforms to entrepreneurial end-users. We believe we must build in ways that create as many opportunities — and catalyze as many amazing Steem-based entrepreneurs and communities — as possible.`;
    expect(entryBodySummary(input, 200)).toMatchSnapshot();
  });

  it('(9) Test with long markdown', () => {
    let input = `<html>
<center><a href='https://d.tube/#!/v/surfermarly/x2zm8s26'><img src='https://steemitimages.com/DQmdxVxFgLu8PT1TchgQUHtd7LGvKtF5u1DbHmDDKALiwxi/dreamsd1.jpg'></a></center><hr>
<p><b>Everybody has a dream. Most of the time it takes us a while to turn these great wishes into reality, especially   because they usually come with a bigger     price tag.</b></p>
<p>Now thanks to Steem some of us will be able to cut corners in order to achieve their goals more quickly. The additional income can be a game changer to many players.</p>
<p>My Steem earnings enabled me to buy a piece of land where I'll build my first own house. Writing down these words still seems a bit unreal to me, since I didn't believe to come to that point so quickly.</p>
<h3>Click on the above image or <a href='https://d.tube/#!/v/surfermarly/x2zm8s26'>HERE ▶️</a> to watch my video statement.</h3>
<p>Without hard work and dedication as well as the great support from the community this wouldn't have been possible. Also the timing was brilliant, I joined in the earlier stages.</p>
<p><b>I'm both grateful and proud.</b></p>
<p>Many people supported me along the way, some tried to tear me down. I'm glad I only stayed with those who pushed me, they have a large stake in my success story.</p></html>`;

    expect(entryBodySummary(input, 200)).toMatchSnapshot();
  });

  it('(10) Test with long markdown', () => {
    let input = `<center><a href='https://d.tube/#!/v/marpemusic/gi5e9yrl'><img src='https://ipfs.io/ipfs/QmYK5yzDHyoDVQQ5xgV4RLzcZz5Qy95Hz1n6qbEusJGHYB'></a></center><hr>
![DTUBE.jpg](https://res.cloudinary.com/hpiynhbhq/image/upload/v1519196266/ebleqjokesumzw3mwpcz.jpg)
###### Hey   Dtube!
###### Hey   Steemian
###### It's your boy marpe @marpemusic. I greet you from my stable, Ibadan Nigeria.
**There's excitement in the air! The epoch making STEEMIB (that is, STEEMIT IBADAN) meet up is around the corner!! Where would you rather be on the 24th of February 2018? You don't want to miss this peeps.**
![meet up.jpeg](https://res.cloudinary.com/hpiynhbhq/image/upload/v1519196411/ihzgikihusxnazqpzltr.jpg)
### Boooommm!!!
I'm giving Three DTUBE & STEEMIT BRANDED TEES to three people for free. Yes, for free. *E fit be you ooo!*
So, how can you qualify to get one?`;

    expect(entryBodySummary(input, 200)).toMatchSnapshot();
  });
});
