/* eslint-disable */

import wordCounter from './word-counter';

describe('Word counter', () => {
  it('word counter test 1', () => {
    const input = `lorem ipsum dolor`;
    const expected = {
      charactersNoSpaces: 15,
      characters: 17,
      words: 3,
      lines: 1
    };
    expect(wordCounter(input)).toMatchObject(expected);
  });

  it('word counter test 2', () => {
    const input = `Lorem ipsum dolor sit amet, consectetur adipiscing elit.\nSuspendisse ullamcorper egestas auctor.\nQuisque semper mauris velit, at auctor eros scelerisque ut. `;
    const expected = {
      charactersNoSpaces: 136,
      characters: 157,
      words: 21,
      lines: 3
    };
    expect(wordCounter(input)).toMatchObject(expected);
  });
});
