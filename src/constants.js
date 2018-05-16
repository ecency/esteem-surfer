export default {
  filters: [
    {
      key: 'FEED',
      name: 'feed'
    },
    {
      key: 'TRENDING',
      name: 'trending'
    },
    {
      key: 'HOT',
      name: 'hot'
    },
    {
      key: 'NEW',
      name: 'created'
    },
    {
      key: 'ACTIVE',
      name: 'active'
    },
    {
      key: 'PROMOTED',
      name: 'promoted'
    },
    {
      key: 'VOTES',
      name: 'votes'
    },
    {
      key: 'COMMENTS',
      name: 'children'
    },
    {
      key: 'PAYOUT',
      name: 'payout'
    }
  ],
  defaultFilter: 'trending',
  postListSize: 20,
  commentListSize: 10,
  servers: [
    'https://api.steemit.com',
    'https://rpc.esteem.ws',
    'https://rpc.steemviz.com',
    'https://rpc.buildteam.io',
    'https://gtg.steem.house:8090',
    'https://steemd.pevo.science',
    'https://steemd.steemitstage.com',
    'https://steemd.previx.io:8090',
    'https://seed.bitcoiner.me',
    'https://rpc.steemliberator.com',
    'https://steemd.minnowsupportproject.org'
  ],
  defaultServer: 'https://api.steemit.com',
  languages: [
    {id: 'en-US', name: 'English'},
    {id: 'en-GB', name: 'English GB'},
    {id: 'en-CA', name: 'English CA'},
    {id: 'en-AU', name: 'English AU'}, //English Australia
    {id: 'es-ES', name: 'Español'},
    {id: 'el-GR', name: 'Ελληνικά'},
    {id: 'fr-FR', name: 'Français'},
    {id: 'de-DE', name: 'Deutsch'},
    {id: 'ru-RU', name: 'Русский'},
    {id: 'bg-BG', name: 'Български'},
    {id: 'nl-NL', name: 'Nederlands'},
    {id: 'hu-HU', name: 'Magyar'},
    {id: 'cs-CZ', name: 'Čeština'},
    {id: 'he-IL', name: 'עברית‎'},
    {id: 'pl-PL', name: 'Polski‎'},
    {id: 'pt-PT', name: 'Português'},
    {id: 'pt-BR', name: 'Português BR'},
    {id: 'sv-SE', name: 'Svensk'},
    {id: 'id-ID', name: 'Bahasa Indonesia'},
    {id: 'zh-CN', name: '简体中文'},
    {id: 'zh-TW', name: '繁體中文'},
    {id: 'dolan', name: 'Dolan'},
    {id: 'uk-UA', name: 'Українська'},
    {id: 'ms-MY', name: 'Bahasa Melayu'},
    {id: 'hr-HR', name: 'Hrvatski'},
    {id: 'fa-IR', name: 'Fārsi'},
    {id: 'it-IT', name: 'Italiano'},
    {id: 'fil-PH', name: 'Wikang Filipino'},
    {id: 'ar-SA', name: 'عَرَبِيّ'},
    {id: 'lt-LT', name: 'Lietuvių'},
    {id: 'lv-LV', name: 'Latviešu'},
    {id: 'ja-JP', name: '日本語'},
    {id: 'bs-BA', name: 'Bosanski'},
    {id: 'ko-KR', name: '한국어'},
    {id: 'fi-FI', name: 'Suomen kieli'},
    {id: 'ur-PK', name: 'اُردُو'},
    {id: 'hi-IN', name: 'हिन्दी'},
    {id: 'th-TH', name: 'ภาษาไทย'},
    {id: 'ta-IN', name: 'தமிழ்'},
    {id: 'sk-SK', name: 'Slovenčina'},
    {id: 'no-NO', name: 'Norsk'},
    {id: 'ne-NP', name: 'नेपाली भाषा'},
    {id: 'ca-ES', name: 'Català'},
    {id: 'bn-BD', name: 'বাংলা'},
    {id: 'sq-AL', name: 'Shqip'},
    {id: 'yo-NG', name: 'Èdè Yorùbá'}, //Yoruba
    {id: 'vi-VN', name: 'Tiếng Việt'}, //Vietnamese
    {id: 'ac-ace', name: 'Basa Acèh'}, //Acehnese
    {id: 'sk-SK', name: 'Slovenščina'}, //Slovenian
    {id: 'si-LK', name: 'සිංහල'}, //Sinhala
    {id: 'ka-GE', name: 'ქართული'}, //Georgian
    {id: 'ro-RO', name: 'Limba română'}, //Romanian
    {id: 'pa-IN', name: 'ਪੰਜਾਬੀ'}, //Punjabi
    {id: 'da-DK', name: 'Dansk'}, //Danish
    {id: 'ha-HG', name: 'Harshen Hausa'}, //Hausa
    {id: 'ceb-PH', name: 'Cebuan'}, //Cebuano
    {id: 'as-IN', name: 'অসমীয়া'}, //Assamese
    {id: 'tr-TR', name: 'Türkçe'} //Turkish
  ],
  defaultLanguage: 'en-US',
  currencies: [
    {id: 'btc', name: 'BTC'},
    {id: 'usd', name: 'USD'},
    {id: 'eur', name: 'EUR'},
    {id: 'rub', name: 'RUB'},
    {id: 'gbp', name: 'GBP'},
    {id: 'jpy', name: 'JPY'},
    {id: 'krw', name: 'KRW'},
    {id: 'inr', name: 'INR'},
    {id: 'cny', name: 'CNY'},
    {id: 'uah', name: 'UAH'},
    {id: 'sek', name: 'SEK'},
    {id: 'try', name: 'TRY'},
    {id: 'cad', name: 'CAD'},
    {id: 'chf', name: 'CHF'},
    {id: 'aud', name: 'AUD'},
    {id: 'nok', name: 'NOK'},
    {id: 'pln', name: 'PLN'},
    {id: 'php', name: 'PHP'},
    {id: 'cad', name: 'CAD'},
    {id: 'chf', name: 'CHF'},
    {id: 'aud', name: 'AUD'},
    {id: 'nok', name: 'NOK'},
    {id: 'pln', name: 'PLN'},
    {id: 'php', name: 'PHP'},
    {id: 'idr', name: 'IDR'},
    {id: 'zar', name: 'ZAR'},
    {id: 'thb', name: 'THB'},
    {id: 'pkr', name: 'PKR'},
    {id: 'vnd', name: 'VND'},
    {id: 'ngn', name: 'NGN'}
  ],
  defaultCurrency: 'usd',
  versionCheckUrl: 'https://api.github.com/repos/eSteemApp/esteem-surfer/releases/latest'
}
