// Styles
import "./stylesheets/app-light.scss";
import "./stylesheets/app-dark.scss";

// Small helpers you might want to keep
import "./helpers/context_menu.js";
import "./helpers/external_links.js";

// Disable zooming
import electron from "electron";

electron.webFrame.setZoomLevelLimits(1, 1);

import marked from 'marked';
import steem from 'steem';

import angular from 'angular';
import {angularRoute} from 'angular-route';
import {angularTranslate} from 'angular-translate';
import {ui} from 'angular-ui-bootstrap';

import {postsCtrl} from './controllers/posts';
import {faqCtrl} from './controllers/faq';
import {aboutCtrl} from './controllers/about'
import settingsCtrl from './controllers/settings';

import {navBarDir} from './directives/navbar';
import {footerDir} from './directives/footer';
import {postListItemDir} from "./directives/post-list-item";
import {sideTagListDir} from "./directives/side-tag-list";

import {discussionsService, tagsService} from "./services";

import constants from './constants';

// will be hidden
const apiUrl = 'http://api.esteem.ws:8080';

angular.module('eSteem', ['ngRoute', 'ui.bootstrap', 'pascalprecht.translate'])

  .config(($translateProvider, $routeProvider, $httpProvider) => {

    // Translations
    $translateProvider.translations('en-US', require('./locales/en-US')); //English
    $translateProvider.translations('ru-RU', require('./locales/ru-RU')); //Russian
    $translateProvider.translations('de-DE', require('./locales/de-DE')); //German
    $translateProvider.translations('fr-FR', require('./locales/fr-FR')); //French
    $translateProvider.translations('es-ES', require('./locales/es-ES')); //Spanish
    $translateProvider.translations('el-GR', require('./locales/el-GR')); //Greek
    $translateProvider.translations('bg-BG', require('./locales/bg-BG')); //Bulgarian
    $translateProvider.translations('nl-NL', require('./locales/nl-NL')); //Dutch
    $translateProvider.translations('hu-HU', require('./locales/hu-HU')); //Hungarian
    $translateProvider.translations('cs-CZ', require('./locales/cs-CZ')); //Czech
    $translateProvider.translations('he-IL', require('./locales/he-IL')); //Hebrew
    $translateProvider.translations('pl-PL', require('./locales/pl-PL')); //Polish
    $translateProvider.translations('pt-PT', require('./locales/pt-PT')); //Portuguese
    $translateProvider.translations('pt-BR', require('./locales/pt-BR')); //Portuguese Brazil
    $translateProvider.translations('id-ID', require('./locales/id-ID')); //Indonesian
    $translateProvider.translations('zh-TW', require('./locales/zh-TW')); //Chinese traditional
    $translateProvider.translations('zh-CN', require('./locales/zh-CN')); //Chinese simplified
    $translateProvider.translations('dolan', require('./locales/dolan')); //Dolan
    $translateProvider.translations('sv-SE', require('./locales/sv-SE')); //Swedish
    $translateProvider.translations('uk-UA', require('./locales/uk-UA')); //Ukrainian
    $translateProvider.translations('ms-MY', require('./locales/ms-MY')); //Malay
    $translateProvider.translations('hr-HR', require('./locales/hr-HR')); //Croatian
    $translateProvider.translations('fa-IR', require('./locales/fa-IR')); //Persian
    $translateProvider.translations('it-IT', require('./locales/it-IT')); //Italian
    $translateProvider.translations('fil-PH', require('./locales/fil-PH')); //Filipino
    $translateProvider.translations('ar-SA', require('./locales/ar-SA')); //Arabic
    $translateProvider.translations('lt-LT', require('./locales/lt-LT')); //Lithuanian
    $translateProvider.translations('lv-LV', require('./locales/lv-LV')); //Latvian
    $translateProvider.translations('ja-JP', require('./locales/ja-JP')); //Japanese
    $translateProvider.translations('bs-BA', require('./locales/bs-BA')); //Bosnian
    $translateProvider.translations('ko-KR', require('./locales/ko-KR')); //Korean
    $translateProvider.translations('fi-FI', require('./locales/fi-FI')); //Finnish
    $translateProvider.translations('ur-PK', require('./locales/ur-PK')); //Urdu Pakistani
    $translateProvider.translations('hi-IN', require('./locales/hi-IN')); //Hindi
    $translateProvider.translations('th-TH', require('./locales/th-TH')); //Thai
    $translateProvider.translations('en-GB', require('./locales/en-GB')); //en-GB
    $translateProvider.translations('en-CA', require('./locales/en-CA')); //en-CA
    $translateProvider.translations('sq-AL', require('./locales/sq-AL')); //Albanian
    $translateProvider.translations('bn-BD', require('./locales/bn-BD')); //Bengali
    $translateProvider.translations('ca-ES', require('./locales/ca-ES')); //Catalan
    $translateProvider.translations('ne-NP', require('./locales/ne-NP')); //Nepali
    $translateProvider.translations('no-NO', require('./locales/no-NO')); //Norwegian
    $translateProvider.translations('sk-SK', require('./locales/sk-SK')); //Slovak
    $translateProvider.translations('ta-IN', require('./locales/ta-IN')); //Tamil
    $translateProvider.translations('yo-NG', require('./locales/yo-NG')); //Yoruba
    $translateProvider.translations('vi-VN', require('./locales/vi-VN')); //Vietnamese
    $translateProvider.translations('ac-ace', require('./locales/ac-ace')); //Acehnese
    $translateProvider.translations('sk-SK', require('./locales/sk-SK')); //Slovenian
    $translateProvider.translations('si-LK', require('./locales/si-LK')); //Sinhala
    $translateProvider.translations('ka-GE', require('./locales/ka-GE')); //Georgian
    $translateProvider.translations('en-AU', require('./locales/en-AU')); //English Australia
    $translateProvider.translations('ro-RO', require('./locales/ro-RO')); //Romanian
    $translateProvider.translations('pa-IN', require('./locales/pa-IN')); //Punjabi
    $translateProvider.translations('da-DK', require('./locales/da-DK')); //Danish
    $translateProvider.translations('ha-HG', require('./locales/ha-HG')); //Hausa
    $translateProvider.translations('ceb-PH', require('./locales/ceb-PH')); //Cebuana
    $translateProvider.translations('as-IN', require('./locales/as-IN')); //Assamese
    $translateProvider.translations('tr-TR', require('./locales/tr-TR')); //Turkish

    $translateProvider.useSanitizeValueStrategy(null);
    $translateProvider.preferredLanguage('en-US');
    $translateProvider.fallbackLanguage('en-US');

    // Routing
    $routeProvider
      .when('/', {
        template: '',
        controller: ($location, constants) => {
          // Redirect to first category page.(Trending) [Better than hard coding category name]
          $location.path('/posts/' + constants.categories[0].name);
        }
      })
      .when('/posts/:category', {
        templateUrl: 'templates/posts.html',
        controller: 'postsCtrl',
      })
      .when('/posts/:category/:tag', {
        templateUrl: 'templates/posts.html',
        controller: 'postsCtrl',
      })
      .when('/faq', {
        templateUrl: 'templates/faq.html',
        controller: 'faqCtrl',
      }).when('/about', {
      templateUrl: 'templates/about.html',
      controller: 'aboutCtrl',
    })
      .when('/posts/:postId', {
        templateUrl: 'templates/post.html',
        controller: 'PostCtrl'
      })
      .otherwise({redirectTo: '/'});

    // $http
    // Prevent caching
    if (!$httpProvider.defaults.headers.get) {
      $httpProvider.defaults.headers.get = {};
    }
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';

  })
  .factory('constants', () => {
    return constants;
  })
  .factory('steemApi', (constants, $rootScope) => {
    steem.api.setOptions({url: $rootScope.server});
    return steem.api;
  })
  .factory('eSteemService', ($http) => {
    return {
      getCurrencyRate: (cur) => {
        return $http.get(`${apiUrl}/api/currencyRate/${ cur.toUpperCase() }/steem`)
      }
    }
  })
  .factory('discussionsService', discussionsService)
  .factory('tagsService', tagsService)
  .factory('storageService', () => {
    return {
      get: (key) => {
        let val = localStorage.getItem(key);
        // Parse to json because it is stringify from object.
        return JSON.parse(val);
      },
      set: (key, val) => {
        let val_ = JSON.stringify(val);
        return localStorage.setItem(key, val_);
      }
    }
  })
  .factory('settingsService', (storageService) => {
    return {
      get: (key, def = null) => {
        let val = storageService.get(`app_setting_${ key }`);
        if (val === null) {
          return def;
        }
        return val;
      },
      set: (key, val) => {
        return storageService.set(`app_setting_${ key }`, val);
      },
      hasSettings: () => {
        for (let key in localStorage) {
          if (key.indexOf('app_setting_') === 0) {
            return true;
          }
        }

        return false;
      }
    }
  })
  .directive('navBar', navBarDir)
  .directive('appFooter', footerDir)
  .directive('sideTagList', sideTagListDir)
  .directive('postListItem', postListItemDir)
  .directive('scrolledBottom', () => {
    return (scope, elm, attr) => {
      let raw = elm[0];

      elm.bind('scroll', () => {
        if ((raw.scrollTop + raw.offsetHeight) + 100 >= raw.scrollHeight) {
          scope.$apply(attr.scrolledBottom);
        }
      });
    };
  })
  .controller('postsCtrl', postsCtrl)
  .controller('faqCtrl', faqCtrl)
  .controller('aboutCtrl', aboutCtrl)
  .controller('settingsCtrl', settingsCtrl)
  .filter('catchPostImage', () => {
    return (inp) => {
      let meta = JSON.parse(inp.json_metadata);
      if (meta.image && meta.image.length > 0) {
        return meta.image[0];
      }

      return null;
    }
  })
  .filter('sumPostTotal', () => {
    return (post, rate) => {
      if (post && post.pending_payout_value && post.last_payout === '1970-01-01T00:00:00') {

        //value.total_payout_value.split(" ")[0])+parseFloat(value.total_pending_payout_value.split(" ")[0])
        //return (parseFloat(value.pending_payout_value.split(" ")[0])*rate);
        return post.total_payout_value ? ((parseFloat(post.total_payout_value.split(" ")[0])) + (parseFloat(post.pending_payout_value.split(" ")[0])) * rate).toFixed(2) : 0;
      } else {
        return post.total_payout_value ? ((parseFloat(post.total_payout_value.split(" ")[0])) + (parseFloat(post.curator_payout_value.split(" ")[0])) * rate).toFixed(2) : 0;
      }
    };
  })
  .filter('authorReputation', () => {
    return (value, bool) => {
      let reputation_level = 1;
      let neg = false;

      if (value < 0)
        neg = true;

      if (value !== 0) {
        reputation_level = Math.log10(Math.abs(value));
        reputation_level = Math.max(reputation_level - 9, 0);

        if (reputation_level < 0)
          reputation_level = 0;
        if (neg)
          reputation_level *= -1;

        reputation_level = (reputation_level * 9) + 25;
      } else {
        return 25;
      }

      return bool ? reputation_level : Math.floor(reputation_level);
    }
  })
  .filter('timeAgo', ($filter) => {

    const timeAgo = (input, allowFuture = false) => {

      const substitute = (stringOrFunction, number, strings) => {
        let s = angular.isFunction(stringOrFunction) ? stringOrFunction(number, dateDifference) : stringOrFunction;
        let v = (strings.numbers && strings.numbers[number]) || number;
        return s.replace(/%d/i, v);
      };

      if (input) {
        let nowTime = (new Date()).getTime();
        let date;
        if (typeof input === 'string' || input instanceof String) {
          date = (input && input.indexOf('Z') === -1) ? (new Date(input + ".000Z")).getTime() : (new Date(input)).getTime();
        } else {
          date = input;
        }

        let strings = {
            prefixAgo: '',
            prefixFromNow: '',
            suffixAgo: $filter('translate')('AGO'),
            suffixFromNow: $filter('translate')('FROM_NOW'),
            seconds: $filter('translate')('SECS'),
            minute: $filter('translate')('A_MIN'),
            minutes: "%d " + $filter('translate')('MINS'),
            hour: $filter('translate')('AN_HOUR'),
            hours: "%d " + $filter('translate')('HOURS'),
            day: $filter('translate')('A_DAY'),
            days: "%d " + $filter('translate')('DAYS'),
            month: $filter('translate')('A_MONTH'),
            months: "%d " + $filter('translate')('MONTHS'),
            year: $filter('translate')('A_YEAR'),
            years: "%d " + $filter('translate')('YEARS')
          },
          dateDifference = nowTime - date,
          words,
          seconds = Math.abs(dateDifference) / 1000,
          minutes = seconds / 60,
          hours = minutes / 60,
          days = hours / 24,
          years = days / 365,
          separator = strings.wordSeparator === undefined ? " " : strings.wordSeparator,

          prefix = strings.prefixAgo,
          suffix = strings.suffixAgo;

        if (allowFuture) {
          if (dateDifference < 0) {
            prefix = strings.prefixFromNow;
            suffix = strings.suffixFromNow;
          }
        }

        words = seconds < 45 && substitute(strings.seconds, Math.round(seconds), strings) ||
          seconds < 90 && substitute(strings.minute, 1, strings) ||
          minutes < 45 && substitute(strings.minutes, Math.round(minutes), strings) ||
          minutes < 90 && substitute(strings.hour, 1, strings) ||
          hours < 24 && substitute(strings.hours, Math.round(hours), strings) ||
          hours < 42 && substitute(strings.day, 1, strings) ||
          days < 30 && substitute(strings.days, Math.round(days), strings) ||
          days < 45 && substitute(strings.month, 1, strings) ||
          days < 365 && substitute(strings.months, Math.round(days / 30), strings) ||
          years < 1.5 && substitute(strings.year, 1, strings) ||
          substitute(strings.years, Math.round(years), strings);

        prefix.replace(/ /g, '');
        words.replace(/ /g, '');
        suffix.replace(/ /g, '');

        return `${prefix} ${words} ${suffix} ${separator}`;
      }
    };

    timeAgo.$stateful = true;
    return timeAgo;

  })
  .filter('postSummary', ($sce) => {
    return (postBody, length = 200) => {

      // Convert markdown to html
      let text = marked(postBody, {
        gfm: true,
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false
      });

      // Remove html tags
      // Remove new lines
      // Remove urls
      text = text.replace(/(<([^>]+)>)/ig, '').replace(/\r?\n|\r/g, ' ').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');

      // Truncate
      text = text.substring(0, length);

      return $sce.trustAsHtml(text);
    }
  })
  .filter('capWord', () => {
    return (s) => {
      return s.substr(0, 1).toUpperCase() + s.substr(1)
    }
  }).filter('__', () => {
  return (s) => {
    return s
  }
})
  .run(function ($rootScope, $uibModal, settingsService, constants, $translate) {

    /*
    Creates default application settings
    */
    $rootScope.setDefaultSettings = () => {
      settingsService.set('theme', 'light-theme');
      settingsService.set('language', constants.defaultLanguage);
      settingsService.set('server', constants.defaultServer);
      settingsService.set('currency', constants.defaultCurrency);
    };

    /*
    Reads application settings from local storage
    */
    $rootScope.readSettings = () => {
      $rootScope.theme = settingsService.get('theme');
      $rootScope.language = settingsService.get('language');
      $rootScope.server = settingsService.get('server');
      $rootScope.currency = settingsService.get('currency');
    };

    // If there is no setting configured (probably first run) create default settings.
    if (!settingsService.hasSettings()) {
      $rootScope.setDefaultSettings();
    }

    // Read settings on startup
    $rootScope.readSettings();

    // Watch language setting changes and set translate language
    $rootScope.$watch('language', (n, o) => {

      // Change locale
      $translate.use(n);

      // Detect and change text direction
      if (['ar-SA', 'he-IL', 'fa-IR', 'ur-PK'].indexOf(n) !== -1) {
        $rootScope.textDir = 'rtl';
      } else {
        $rootScope.textDir = 'ltr';
      }
    });
  });


window.onload = () => {
  setTimeout(() => {
    document.body.style.visibility = 'visible';
  }, 300);
};
