/* eslint-disable */

import merge from 'deepmerge';

const enUs = require('./en-US.json');

export default {
  'en-US': enUs,
  'ru-RU': merge.all([enUs, require('./ru-RU.json')]),
  'es-ES': merge.all([enUs, require('./es-ES.json')]),
  'pt-PT': merge.all([enUs, require('./pt-PT.json')]),
  'pl-PL': merge.all([enUs, require('./pl-PL.json')]),
  'hu-HU': merge.all([enUs, require('./hu-HU.json')]),
  'nl-NL': merge.all([enUs, require('./nl-NL.json')]),
  'ko-KR': merge.all([enUs, require('./ko-KR.json')]),
  'de-DE': merge.all([enUs, require('./de-DE.json')]),
  'ro-RO': merge.all([enUs, require('./ro-RO.json')])
};

export const locales = [
  { id: 'en-US', name: 'English' },
  { id: 'ru-RU', name: 'Русский' },
  { id: 'es-ES', name: 'Español' },
  { id: 'pt-PT', name: 'Português' },
  { id: 'pl-PL', name: 'Polski' },
  { id: 'hu-HU', name: 'Magyar' },
  { id: 'nl-NL', name: 'Dutch' },
  { id: 'ko-KR', name: 'Korean' },
  { id: 'de-DE', name: 'German' },
  { id: 'ro-RO', name: 'Romanian' }
];

export const intlLocale = l => {
  switch (l) {
    case 'ru-RU':
      return 'ru';
    case 'es-ES':
      return 'es';
    case 'pt-PT':
      return 'pt';
    case 'pl-PL':
      return 'pl';
    case 'hu-HU':
      return 'hu';
    case 'nl-NL':
      return 'nl';
    case 'ko-KR':
      return 'ko';
    case 'de-DE':
      return 'de';
    case 'ro-RO':
      return 'ro';
    default:
      return 'en-US';
  }
};
