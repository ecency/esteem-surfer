const Typo = require('typo-js');

const affData = require('./data/spell-check/en_US/en_US.aff');
const dicData = require('./data/spell-check/en_US/en_US.dic');

const dictionary = new Typo('en_US', affData, dicData);

const spCache = {};

const definedList = [
  'crypto',
  'bitcoin',
  'steem',
  'blockchain',
  'sbd',
  'steemit',
  'esteem'
];

window.isMisspelled = str => {
  if (spCache[str]) {
    return spCache[str];
  }

  if (definedList.includes(str.toLowerCase())) {
    return false;
  }

  const r = !dictionary.check(str);

  spCache[str] = r;

  return r;
};

window.getSpellingCorrections = text =>
  new Promise(resolve => {
    resolve(dictionary.suggest(text));
  });
