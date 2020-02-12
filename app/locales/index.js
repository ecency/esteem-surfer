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
  'ro-RO': merge.all([enUs, require('./ro-RO.json')]),
  'ms-MY': merge.all([enUs, require('./ms-MY.json')]),
  'lt-LT': merge.all([enUs, require('./lt-LT.json')]),
  'zh-CN': merge.all([enUs, require('./zh-CN.json')]),
  'zh-TW': merge.all([enUs, require('./zh-TW.json')]),
  'id-ID': merge.all([enUs, require('./id-ID.json')]),
  'sr-CS': merge.all([enUs, require('./sr-CS.json')]),
  'yo-NG': merge.all([enUs, require('./yo-NG.json')]),
  'uk-UA': merge.all([enUs, require('./uk-UA.json')]),
  'tr-TR': merge.all([enUs, require('./tr-TR.json')]),
  'sv-SE': merge.all([enUs, require('./sv-SE.json')]),
  'ja-JP': merge.all([enUs, require('./ja-JP.json')]),
  'hu-HU': merge.all([enUs, require('./hu-HU.json')]),
  'fr-FR': merge.all([enUs, require('./fr-FR.json')]),
  'it-IT': merge.all([enUs, require('./it-IT.json')]),
  'he-IL': merge.all([enUs, require('./he-IL.json')])
};

export const locales = [
  { id: 'en-US', name: 'English' },
  { id: 'ru-RU', name: 'Русский' },
  { id: 'es-ES', name: 'Español' },
  { id: 'pt-PT', name: 'Português' },
  { id: 'pl-PL', name: 'Polski' },
  { id: 'hu-HU', name: 'Magyar' },
  { id: 'nl-NL', name: 'Dutch' },
  { id: 'ko-KR', name: '한국어' },
  { id: 'de-DE', name: 'Deutsch' },
  { id: 'ro-RO', name: 'Românește' },
  { id: 'ms-MY', name: 'Bahasa Melayu' },
  { id: 'lt-LT', name: 'Lietuvių' },
  { id: 'zh-CN', name: '汉语' },
  { id: 'zh-TW', name: '漢語' },
  { id: 'id-ID', name: 'Bahasa Indonesia' },
  { id: 'sr-CS', name: 'Srpski' },
  { id: 'yo-NG', name: 'Èdè Yorùbá' },
  { id: 'uk-UA', name: 'Ukraïnska' },
  { id: 'tr-TR', name: 'Türkçe' },
  { id: 'sv-SE', name: 'Svenska' },
  { id: 'ja-JP', name: '日本語' },
  { id: 'hu-HU', name: 'Magyar' },
  { id: 'fr-FR', name: 'Français' },
  { id: 'it-IT', name: 'Italiano' },
  { id: 'he-IL', name: 'עברית' }
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
    case 'ms-MY':
      return 'ms';
    case 'lt-LT':
      return 'lt';
    case 'zh-CN':
      return 'zh';
    case 'zh-TW':
      return 'zh';
    case 'id-ID':
      return 'id';
    case 'sr-CS':
      return 'sr';
    case 'yo-NG':
      return 'yo';
    case 'uk-UA':
      return 'uk';
    case 'tr-TR':
      return 'tr';
    case 'sv-SE':
      return 'sv';
    case 'ja-JP':
      return 'ja';
    case 'hu-HU':
      return 'hu';
    case 'fr-FR':
      return 'fr';
    case 'it-IT':
      return 'it';
    case 'he-IL':
      return 'he';
    default:
      return 'en-US';
  }
};
