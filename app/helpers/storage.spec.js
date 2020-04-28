/* eslint-disable */

import { getItem, setItem, removeItem, getByPrefix } from './storage';

describe('storage', () => {
  it('(1) getItem', () => {
    expect(getItem('foo')).toBe(null);
  });

  it('(2) getItem with default value', () => {
    expect(getItem('foo', 1)).toBe(1);
  });

  it('(3) setItem', () => {
    setItem('foo', 2);
    expect(getItem('foo')).toBe(2);
  });

  it('(4) removeItem', () => {
    removeItem('foo');
    expect(getItem('foo')).toBe(null);
  });

  it('(5) setItem object', () => {
    setItem('foo', { bar: 'baz' });
    expect(getItem('foo')).toEqual({ bar: 'baz' });
  });

  it('(6) getByPrefix', () => {
    setItem('zoo', { x: 'yyy' });
    setItem('foooox', { m: 'nnn' });
    expect(getByPrefix('fo')).toEqual([{ bar: 'baz' }, { m: 'nnn' }]);
  });
});
