String.prototype.hashCode = function () {
  // See: https://stackoverflow.com/a/8831937/3720614

  let hash = 0;
  if (this.length === 0) {
    return hash;
  }
  for (let i = 0; i < this.length; i++) {
    let char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

const genRandom = function () {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

import {remote, shell} from "electron";
import env from "env";
import jetpack from "fs-jetpack";
import steem from 'steem';
import path from 'path';

import jq from 'jquery';

// Angular and related dependencies
import angular from 'angular';
import {angularRoute} from 'angular-route';
import {angularTranslate} from 'angular-translate';
import ui from 'angular-ui-bootstrap';
import {slider} from 'angularjs-slider';

// Controllers
import postsCtrl from './controllers/posts';
import postCtrl from './controllers/post';
import authorCtrl from './controllers/author';
import contentVotersCtrl from './controllers/content-voters';
import settingsCtrl from './controllers/settings';
import loginCtrl from './controllers/login'
import feedCtrl from './controllers/feed';
import bookmarksCtrl from './controllers/bookmarks';
import tagsCtrl from './controllers/tags';


import faqCtrl from './controllers/faq';
import aboutCtrl from './controllers/about'
import tokenMarketCtrl from './controllers/token-market';
import marketPlaceCtrl from './controllers/market-place';


// Directives
import navBarDir from './directives/navbar';
import footerDir from './directives/footer';
import postListItemDir from './directives/post-list-item';
import sideTagListDir from './directives/side-tag-list';
import scrolledBottomDir from './directives/scrolled-bottom';
import authorBgImgStyleDir from './directives/author-bg-img-style';
import commentListDir from './directives/comment-list';
import commentListItemDir from './directives/comment-list-item';
import authorNameDir from './directives/author-name';
import contentPayoutInfoDir from './directives/content-payout-info';
import contentVotersInfoDir from './directives/content-voters-info';
import contentListItemChildDir from './directives/content-list-item-child'
import autoFocusDir from './directives/autofocus';
import loginRequiredDir from './directives/login-required';
import contentVoteDir from './directives/content-vote';


// Services
import steemService from './services/steem';
import {helperService} from './services/helper';
import storageService from './services/storage';
import settingsService from './services/settings';
import userService from './services/user';
import steemAuthenticatedService from './services/steem-authenticated';


// Filters
import {catchPostImageFilter} from './filters/catch-post-image';
import sumPostTotalFilter from './filters/sum-post-total';
import {authorReputationFilter} from './filters/author-reputation';
import timeAgoFilter from './filters/time-ago';
import {postSummaryFilter} from './filters/post-summary';
import {markDown2Html, markDown2HtmlFilter} from './filters/markdown-2-html'
import {capWordFilter} from './filters/cap-word';
import currencySymbolFilter from './filters/currency-symbol';
import dateFormattedDir from './filters/date-formatted.js';
import {contentSummaryChildFilter} from './filters/content-summary-child';
import steemPowerFilter from './filters/steem-power';
import steemDollarFilter from './filters/steem-dollar';


import constants from './constants';


const app = remote.app;


// will be hidden
const apiUrl = 'http://api.esteem.ws:8080';

angular.module('eSteem', ['ngRoute', 'ui.bootstrap', 'pascalprecht.translate', 'rzModule'])

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
        controller: ($rootScope, $location, activeUsername, constants) => {
          if (activeUsername()) {
            // If user logged in redirect to feed
            $location.path(`/feed/${activeUsername()}`);
          } else {
            // Redirect to default filter page
            $location.path('/posts/' + constants.defaultFilter);
          }
        }
      })
      .when('/posts/:filter', {
        templateUrl: 'templates/posts.html',
        controller: 'postsCtrl',
      })
      .when('/posts/:filter/:tag', {
        templateUrl: 'templates/posts.html',
        controller: 'postsCtrl',
      })
      .when('/post/:parent/:author/:permlink', {
        templateUrl: 'templates/post.html',
        controller: 'postCtrl',
      })
      .when('/post/:parent/:author/:permlink/:comment', {
        templateUrl: 'templates/post.html',
        controller: 'postCtrl',
      })
      .when('/account/:username', {
        templateUrl: 'templates/author.html',
        controller: 'authorCtrl',
      })
      .when('/account/:username/:section', {
        templateUrl: 'templates/author.html',
        controller: 'authorCtrl',
      })
      .when('/faq', {
        templateUrl: 'templates/faq.html',
        controller: 'faqCtrl',
      })
      .when('/about', {
        templateUrl: 'templates/about.html',
        controller: 'aboutCtrl',
      })
      .when('/token-market', {
        templateUrl: 'templates/token-market.html',
        controller: 'tokenMarketCtrl',
      })
      .when('/market-place', {
        templateUrl: 'templates/market-place.html',
        controller: 'marketPlaceCtrl',
      })
      .when('/feed/:username', {
        templateUrl: 'templates/feed.html',
        controller: 'feedCtrl'
      })
      .when('/tags', {
        templateUrl: 'templates/tags.html',
        controller: 'tagsCtrl'
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
    return {
      getApi: () => {
        steem.api.setOptions({url: $rootScope.server});
        return steem.api;
      }
    }
  })
  .factory('eSteemService', ($http) => {
    return {
      getCurrencyRate: (cur) => {
        return $http.get(`${apiUrl}/api/currencyRate/${ cur.toUpperCase() }/steem`)
      },
      addBookmark: function (username, content) {
        return $http.post(`${apiUrl}/api/bookmark`, {
          username: username,
          author: content.author,
          permlink: content.permlink,
          chain: 'steem'
        });
      },
      getBookmarks: function (user) {
        return $http.get(`${apiUrl}/api/bookmarks/${user}`);
      },
      removeBookmark: function (id, user) {
        return $http.delete(`${apiUrl}/api/bookmarks/${user}/${id}/`);
      },
    }
  })
  .factory('steemService', steemService)
  .factory('steemAuthenticatedService', steemAuthenticatedService)
  .factory('storageService', storageService)
  .factory('settingsService', settingsService)
  .factory('userService', userService)
  .factory('helperService', helperService)
  .factory('activeUsername', ($rootScope) => {
    return () => {
      if ($rootScope.user) {
        return $rootScope.user.username
      }
      return null;
    };
  })

  .directive('navBar', navBarDir)
  .directive('appFooter', footerDir)
  .directive('sideTagList', sideTagListDir)
  .directive('postListItem', postListItemDir)
  .directive('scrolledBottom', scrolledBottomDir)
  .directive('authorBgImgStyle', authorBgImgStyleDir)
  .directive('commentList', commentListDir)
  .directive('commentListItem', commentListItemDir)
  .directive('authorName', authorNameDir)
  .directive('contentPayoutInfo', contentPayoutInfoDir)
  .directive('contentVotersInfo', contentVotersInfoDir)
  .directive('contentListItemChild', contentListItemChildDir)
  .directive('autoFocus', autoFocusDir)
  .directive('loginRequired', loginRequiredDir)
  .directive('contentVote', contentVoteDir)

  .controller('postsCtrl', postsCtrl)
  .controller('faqCtrl', faqCtrl)
  .controller('aboutCtrl', aboutCtrl)
  .controller('settingsCtrl', settingsCtrl)
  .controller('loginCtrl', loginCtrl)
  .controller('contentVotersCtrl', contentVotersCtrl)
  .controller('postCtrl', postCtrl)
  .controller('authorCtrl', authorCtrl)
  .controller('tokenMarketCtrl', tokenMarketCtrl)
  .controller('marketPlaceCtrl', marketPlaceCtrl)
  .controller('feedCtrl', feedCtrl)
  .controller('bookmarksCtrl', bookmarksCtrl)
  .controller('tagsCtrl', tagsCtrl)

  .filter('catchPostImage', catchPostImageFilter)
  .filter('sumPostTotal', sumPostTotalFilter)
  .filter('authorReputation', authorReputationFilter)
  .filter('timeAgo', timeAgoFilter)
  .filter('postSummary', postSummaryFilter)
  .filter('markDown2Html', markDown2HtmlFilter)
  .filter('capWord', capWordFilter)
  .filter('currencySymbol', currencySymbolFilter)
  .filter('dateFormatted', dateFormattedDir)
  .filter('contentSummaryChild', contentSummaryChildFilter)
  .filter('steemPower', steemPowerFilter)
  .filter('steemDollar', steemDollarFilter)
  .filter('money2Number', () => {
    return (input) => {
      if (input) {
        return (Number(input.split(" ")[0]).toFixed(3));
      }

      return ''
    }
  })
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
        case 'NO_COMMENTS_YET':
          return 'No comments yet';
        case 'COMMENTS_PAGE':
          return 'page:';
        case 'TOKEN_MARKET':
          return 'Token Market';
        case 'VOTING_POWER':
          return 'Voting Power';
        case 'POST_COUNT':
          return 'Post Count';
        case 'RESTEEMED':
          return 'resteemed';
        case 'GO_BACK':
          return 'Back';
        case 'PLATFORM_NAME':
          return 'Steem';
        case 'PLATFORM_POWER':
          return 'Steem Power';
        case 'PLATFORM_DOLLAR':
          return 'Steem Dollar';
        case 'PLATFORM_L_UNIT':
          return 'STEEM';
        case 'PLATFORM_P_UNIT':
          return 'SP';
        case 'PLATFORM_D_UNIT':
          return 'SBD';
        case 'NO_DATA':
          return 'No Data';
        case 'LOGIN_PUBLIC_KEY_ERROR':
          return 'You need a private password or key (not a public key)';
        case 'LOGIN_SUCCESS':
          return 'Logged In';
        case 'ACCOUNTS':
          return 'Accounts';
        case 'LOGIN_AS':
          return 'Login As';
        case 'EMPTY_LIST':
          return 'Nothing here...';
        case 'SEARCH_BOOKMARKS':
          return 'Search in bookmarks...';
        default:
          return s;
      }
    }
  })

  .run(function ($rootScope, $uibModal, $translate, $timeout, $interval, $location, $window, $q, eSteemService, steemService, settingsService, userService, activeUsername, constants) {


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
    // Default currency's (USD) rate = 1
    $rootScope.currencyRate = 1;

    const fetchCurrencyRate = (broadcast = false) => {
      eSteemService.getCurrencyRate($rootScope.currency).then((resp) => {
        let newCurrRate = resp.data;
        if (newCurrRate !== $rootScope.currencyRate) {
          $rootScope.currencyRate = newCurrRate;
          if (broadcast) {
            $rootScope.$broadcast('currencyChanged')
          }
        }
      }); // TODO: Handle catch
    };

    if ($rootScope.currency !== constants.defaultCurrency) {
      // Fetch currency rate data on startup if selected currency is not default currency.
      fetchCurrencyRate();
    }

    // Refresh currency rate in every minute. Broadcast if changed.
    $interval(() => fetchCurrencyRate(true), 60000);

    // STEEM GLOBAL PROPERTIES
    $rootScope.steemPerMVests = 1;
    $rootScope.base = 1;
    $rootScope.fundRecentClaims = 1;
    $rootScope.fundRewardBalance = 1;

    const fetchSteemGlobalProperties = () => {
      steemService.getDynamicGlobalProperties()
        .then(r => {
          let steemPerMVests = (Number(r.total_vesting_fund_steem.substring(0, r.total_vesting_fund_steem.length - 6)) / Number(r.total_vesting_shares.substring(0, r.total_vesting_shares.length - 6))) * 1e6;
          $rootScope.steemPerMVests = steemPerMVests;

          return steemService.getFeedHistory()
        })
        .then(r => {
          let base = r.current_median_history.base.split(" ")[0];
          $rootScope.base = base;
          return steemService.getRewardFund();
        }).then(r => {
        $rootScope.fundRecentClaims = r.recent_claims;
        $rootScope.fundRewardBalance = r.reward_balance.split(" ")[0];
      })
    };

    fetchSteemGlobalProperties();

    // Refresh global properties in every minute.
    $interval(() => fetchSteemGlobalProperties(), 60000);

    // Last logged user
    $rootScope.user = userService.getActive();

    // Set active user when new user logged in
    $rootScope.$on('userLoggedIn', () => {
      $rootScope.user = userService.getActive();
    });

    $rootScope.$on('userLoggedOut', () => {
      $rootScope.user = null;
    });

    // USER PROPS. Account data detail for active user.
    $rootScope.userProps = null;
    const fetchUserProps = () => {
      const a = activeUsername();
      if (!a) {
        $rootScope.userProps = null;
        return;
      }
      steemService.getAccounts([a]).then(r => {
        $rootScope.userProps = r[0];
      });
    };

    fetchUserProps();

    // Refresh users props in every minute.
    $interval(() => fetchUserProps(), 60000);

    // Invalidate when user logged in
    $rootScope.$on('userLoggedIn', () => {
      $rootScope.userProps = null;
      fetchUserProps();
    });

    // or logged out
    $rootScope.$on('userLoggedOut', () => {
      $rootScope.userProps = null;
    });


    // NAVIGATION CACHE
    // The purpose of navigation caching is show last position and data of the page to user without
    // reloading when the user clicks back button.
    // It is not nice to scroll the page at the top and reload when the user clicks the back button.

    // HISTORY MANAGER
    $rootScope.navHistory = [];

    // A flag to find out user triggered $rootScope.goBack (clicked back button)
    $rootScope.isBack = false;

    // Pops last path from navHistory and redirects.
    $rootScope.goBack = () => {
      if (!$rootScope.navHistory.length) {
        return false;
      }

      let l = $rootScope.navHistory.pop();
      $rootScope.isBack = true;
      $location.path(l);
    };

    $rootScope.lastVisitedPath = null;

    $rootScope.$on('$routeChangeSuccess', () => {

      /* Before push a path to navHistory:
      Last visited path should be not empty (at least one path visited)
      $rootScope.goBack should not be triggered (go back button should not be clicked)
      Path should not be root (there is a redirect rule for /)
      */
      if ($rootScope.lastVisitedPath && !$rootScope.isBack && $rootScope.lastVisitedPath !== '/') {
        // push last visited path to history
        $rootScope.navHistory.push($rootScope.lastVisitedPath);
      }

      // update last visited path
      $rootScope.lastVisitedPath = $location.$$path;
    });

    // POSITION MANAGER
    $rootScope.navPosCache = {};

    $rootScope.$on('$routeChangeStart', function () {
      // Save last position of main content when leaving
      let mainEl = document.querySelector('#content-main.keep-pos');
      if (mainEl) {
        let key = $window.location.href.hashCode();

        $rootScope.navPosCache[key] = mainEl.scrollTop;
      }
    });

    $rootScope.$on('$routeChangeSuccess', function () {

      // Do nothing if back button not clicked
      if (!$rootScope.isBack) {
        return false;
      }

      $timeout(function () {
        let mainEl = document.querySelector('#content-main.keep-pos');
        if (mainEl) {
          let key = $window.location.href.hashCode();
          let top = $rootScope.navPosCache[key];
          if (top) {
            mainEl.scrollTop = top;
          }
        }
      }, 0);
    });

    // DATA MANAGER
    let cacheData = {};
    $rootScope.Data = {};

    $rootScope.setNavVar = (varKey, val) => {
      let key = $window.location.href.hashCode();

      if (!cacheData[key]) {
        cacheData[key] = {};
      }

      cacheData[key][varKey] = val;
    };

    $rootScope.$on('$routeChangeSuccess', () => {
      // When route changed pass relative data from cacheData to $rootScope.Data
      let key = $window.location.href.hashCode();

      $rootScope.Data = cacheData[key] || {};
    });

    // After all navigation cache managers, toggle $rootScope.isBack if true
    $rootScope.$on('$routeChangeSuccess', () => {
      if ($rootScope.isBack) {
        $rootScope.isBack = false;
      }
    });

    // The last selected filter from navbar
    $rootScope.selectedFilter = constants.defaultFilter;

    // The last selected post from post list
    $rootScope.selectedPost = {};

    // Click handler for external links
    jq('body').on('click', 'a[target="_external"]', function (event) {
      event.preventDefault();
      let href = jq(this).attr('href');
      shell.openExternal(href);
    });

    // Click handlers for markdown
    $rootScope.$on('go-to-path', (o, u) => {
      $location.path(u);
      if (!$rootScope.$$phase) {
        $rootScope.$apply();
      }
    });

    jq('body').on('click', '.markdown-view .markdown-external-link', function (event) {
      event.preventDefault();
      let href = jq(this).data('href');
      shell.openExternal(href);
    });

    jq('body').on('click', '.markdown-view .markdown-post-link', function (event) {
      event.preventDefault();
      let tag = jq(this).data('tag');
      let author = jq(this).data('author');
      let permLink = jq(this).data('permlink');
      let u = `/post/${tag}/${author}/${permLink}`;
      $rootScope.$broadcast('go-to-path', u);
    });

    jq('body').on('click', '.markdown-view .markdown-author-link', function (event) {
      event.preventDefault();
      let author = jq(this).data('author');
      let u = `/account/${author}`;
      $rootScope.$broadcast('go-to-path', u);
    });

    jq('body').on('click', '.markdown-view .markdown-tag-link', function (event) {
      event.preventDefault();
      let tag = jq(this).data('tag');
      let u = `/posts/${$rootScope.selectedFilter}/${tag}`;
      $rootScope.$broadcast('go-to-path', u);
    });

    // BOOKMARKS
    $rootScope.bookmarks = [];
    const fetchBookmarks = () => {
      $rootScope.bookmarks = [];
      eSteemService.getBookmarks($rootScope.user.username).then((resp) => {
        let temp = [];

        // Create timestamps and search titles for each bookmark item. Timestamps will be used for sorting.
        for (let i of resp.data) {
          temp.push(Object.assign(
            {},
            i,
            {searchTitle: `${i.author} ${i.permlink} ${i.author.replace(/-/g, ' ')} ${i.permlink.replace(/-/g, ' ')}`.toLowerCase()}
          ));
        }

        $rootScope.bookmarks = temp;
      });
    };

    if ($rootScope.user) {
      fetchBookmarks();
    }

    // Fetch bookmarks on login
    $rootScope.$on('userLoggedIn', () => {
      fetchBookmarks();
    });

    // Set bookmarks to empty list when user logged out
    $rootScope.$on('userLoggedOut', () => {
      $rootScope.bookmarks = [];
    });

    // Refresh bookmarks when new bookmark created
    $rootScope.$on('newBookmark', () => {
      fetchBookmarks();
    });

    // Error messages to show user when remote server errors occurred
    $rootScope.errorMessages = [];
    $rootScope.showError = (message) => {
      $rootScope.errorMessages.push({
        id: genRandom(),
        text: message
      });
      $timeout(() => {
        $rootScope.errorMessages.shift();
      }, 5000)
    };

    // An helper to collect post body samples
    $rootScope.showMarkdownResultHelper = (env.name === 'development');
    $rootScope.saveMarkdownResult = (id, markdown) => {

      let savePath = path.join(app.getAppPath(), 'test-data', 'markdown-2-html', id + '.json');
      if (jetpack.exists(savePath)) {
        if (!confirm(savePath + ' exists. Overwrite?')) {
          return false;
        }
      }

      let html = markDown2Html(markdown);
      let writeData = {'id': id, input: markdown, result: html};

      jetpack.write(savePath, writeData);
      console.log('Saved to: ' + savePath);
    };
  });
