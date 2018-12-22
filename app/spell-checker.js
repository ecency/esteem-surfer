import { SpellCheckHandler } from 'electron-spellchecker';

const spCache = {};

const spellChecker = new SpellCheckHandler();

spellChecker.switchLanguage('en-US');

window.isMisspelled = str => {
  if (spCache[str]) {
    return spCache[str];
  }

  const r = spellChecker.isMisspelled(str);

  spCache[str] = r;

  return r;
};

window.getSpellingCorrections = text =>
  spellChecker.getCorrectionsForMisspelling(text);
