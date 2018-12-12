import { SpellCheckHandler } from 'electron-spellchecker';

const spellChecker = new SpellCheckHandler();

spellChecker.switchLanguage('en-US');

window.isMisspelled = str => spellChecker.isMisspelled(str);

window.getSpellingCorrections = text =>
  spellChecker.getCorrectionsForMisspelling(text);
