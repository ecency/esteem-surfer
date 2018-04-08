import {sanitizeNode} from './html-sanitizer';
import {expect} from "chai";


describe('Html Sanitizer', () => {
  it('Should convert not allowed tag to span', () => {
    const input = `<script>document.getElementById('body').remove();</script>`;
    const expected = '<span>document.getElementById(\'body\').remove();</span>';

    const el = document.createElement('div');
    el.innerHTML = input;
    const res = sanitizeNode(el);

    expect(res.innerHTML).to.equal(expected);
  });

  it('Should convert not allowed tag to span safely for wrong markup', () => {
    const input = `<script>document.getElementById('body').remove();<script>`;
    const expected = '<span>document.getElementById(\'body\').remove();&lt;script&gt;</span>';

    const el = document.createElement('div');
    el.innerHTML = input;
    const res = sanitizeNode(el);

    expect(res.innerHTML).to.equal(expected);
  });

  it('Should remove not allowed attributes', () => {
    const input = `<a title="Foo" onclick="document.bar()">Click</a>`;
    const expected = '<a title="Foo">Click</a>';

    const el = document.createElement('div');
    el.innerHTML = input;
    const res = sanitizeNode(el);

    expect(res.innerHTML).to.equal(expected);
  });
});
