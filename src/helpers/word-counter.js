export const wordCounter = (val) => {
  const wom = val.match(/\S+/g);
  return {
    charactersNoSpaces: val.replace(/\s+/g, '').length,
    characters: val.length,
    words: wom ? wom.length : 0,
    lines: val.split(/\r*\n/).length
  };
};

