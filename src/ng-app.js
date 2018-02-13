import steem from 'steem';

// Angular and related dependencies
import angular from 'angular';
import {angularRoute} from 'angular-route';
import {angularTranslate} from 'angular-translate';
import ui from 'angular-ui-bootstrap';

// Controllers
import postsCtrl from './controllers/posts';
import faqCtrl from './controllers/faq';
import aboutCtrl from './controllers/about'
import settingsCtrl from './controllers/settings';

// Directives
import navBarDir from './directives/navbar';
import footerDir from './directives/footer';
import postListItemDir from './directives/post-list-item';
import sideTagListDir from './directives/side-tag-list';
import scrolledBottomDir from './directives/scrolled-bottom';

// Services
import {discussionsService, tagsService} from "./services";

// Filters
import catchPostImageFilter from './filters/catch-post-image';
import sumPostTotalFilter from './filters/sum-post-total';
import authorReputation from './filters/author-reputation';
import timeAgoFilter from './filters/time-ago';
import postSummaryFilter from './filters/post-summary';
import capWordFilter from './filters/cap-word';

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
  .directive('scrolledBottom', scrolledBottomDir)
  .controller('postsCtrl', postsCtrl)
  .controller('faqCtrl', faqCtrl)
  .controller('aboutCtrl', aboutCtrl)
  .controller('settingsCtrl', settingsCtrl)
  .filter('catchPostImage', catchPostImageFilter)
  .filter('sumPostTotal', sumPostTotalFilter)
  .filter('authorReputation', authorReputation)
  .filter('timeAgo', timeAgoFilter)
  .filter('postSummary', postSummaryFilter)
  .filter('capWord', capWordFilter)
  .filter('__', () => {
    // Temporary filter to figure out different language entries from eSteem mobile app's locale files
    return (s) => {
      switch (s) {
        case 'CUSTOM_SERVER':
          return 'Custom server address';
        case 'INVALID_SERVER_ADDRESS':
          return 'Invalid server address';
        case 'SERVER_FAILED':
          return 'Server failed';
        case 'SERVER_TIME_ERR':
          return 'Server does not seem alive ';
        case 'DEFAULT_SETTINGS':
          return 'Default Settings';
        default:
          return s;
      }
    }
  })
  .run(function ($rootScope, $uibModal, $translate, $timeout, $interval, eSteemService, settingsService, constants) {

    // SETTINGS
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
    // It can only change from settingsService
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


    // CURRENCY
    // Default currency's (usd) rate = 1
    $rootScope.currencyRate = 1;

    const fetchCurrencyRate = (broadcast = false) => {
      eSteemService.getCurrencyRate($rootScope.currency).then((resp) => {
        let newCurrRate = resp.data;
        if (newCurrRate !== $rootScope.currencyRate) {
          $rootScope.currencyRate = newCurrRate;
          if (broadcast) {
            $rootScope.$broadcast('currRateChanged')
          }
        }
      });

      // TODO: Handle catch
    };

    // Watch currency variable. Refresh rate when changed
    // It can only change from settingsService
    $rootScope.$watch('currency', (n, o) => {
      if (n === o) {
        return
      }

      fetchCurrencyRate(true);
    });

    if ($rootScope.currency !== constants.defaultCurrency) {
      // If selected currency is not default currency then fetch rate data
      fetchCurrencyRate()
    }

    // Refresh currency rate in every minute. Broadcast if changed
    $interval(() => fetchCurrencyRate(true), 60000);
  });
