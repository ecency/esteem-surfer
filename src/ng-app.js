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
import editorCtrl from './controllers/editor';
import searchCtrl from './controllers/search';
import draftsCtrl from './controllers/drafts';
import schedulesCtrl from './controllers/schedules';
import galleryCtrl from './controllers/gallery';
import transferCtrl from './controllers/transfer';
import escrowCtrl from './controllers/escrow';
import escrowActionsCtrl from './controllers/escrow-actions';
import powerUpCtrl from './controllers/power-up';
import powerDownCtrl from './controllers/power-down';
import addWithDrawAccountCtrl from './controllers/add-withdraw-account';
import profileEditCtrl from './controllers/profile-edit';
import welcomeCtrl from './controllers/welcome';
import pinCreateCtrl from './controllers/pin-create';
import pinDialogCtrl from './controllers/pin-dialog';
import favoritesCtrl from './controllers/favorites';
import followersCtrl from './controllers/followers';
import followingCtrl from './controllers/following';
import witnessesCtrl from './controllers/witnesses';


import tokenExchangeCtrl from './controllers/token-exchange';
import marketPlaceCtrl from './controllers/market-place';
import discoverCtrl from './controllers/discover';


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
import contentEditorDir from './directives/content-editor';
import contentEditorControlsDir from './directives/content-editor-controls';
import fallbackSrcDir from './directives/fallback-src';
import contentListItemSearchDir from './directives/content-list-item-search';
import commentEditorDir from './directives/comment-editor';
import draftListItemDir from './directives/draft-list-item';
import scheduleListItemDir from './directives/schedule-list-item';
import galleryListItemDir from './directives/gallery-list-item';
import transferNavBarDir from './directives/transfer-navbar';
import contentListLoadingItemDir from './directives/content-list-loading-item';
import showBgImageOnModalDir from './directives/show-bg-image-on-modal';


// Services
import steemService from './services/steem';
import {helperService} from './services/helper';
import storageService from './services/storage';
import settingsService from './services/settings';
import userService from './services/user';
import steemAuthenticatedService from './services/steem-authenticated';
import eSteemService from './services/esteem';
import editorService from './services/editor';
import cryptoService from './services/crypto';
import pinService from './services/pin'

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
import version from './version';

const app = remote.app;

const ngApp = angular.module('eSteem', ['ngRoute', 'ui.bootstrap', 'pascalprecht.translate', 'rzModule']);

import config from './config';

config(ngApp);

ngApp.config(($translateProvider, $routeProvider, $httpProvider) => {

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
      controller: ($rootScope, $location, activeUsername, helperService, pinService, constants) => {
        if (!helperService.getWelcomeFlag()) {
          $location.path(`/welcome`);
          return;
        }

        if (!pinService.getPinHash()) {
          $location.path(`/pin-create`);
          return;
        }

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
    .when('/token-exchange', {
      templateUrl: 'templates/token-exchange.html',
      controller: 'tokenExchangeCtrl',
    })
    .when('/discover', {
      templateUrl: 'templates/discover.html',
      controller: 'discoverCtrl',
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
    .when('/editor', {
      templateUrl: 'templates/editor.html',
      controller: 'editorCtrl'
    })
    .when('/editor/:author/:permlink', {
      templateUrl: 'templates/editor.html',
      controller: 'editorCtrl'
    })
    .when('/search/:obj', {
      templateUrl: 'templates/search.html',
      controller: 'searchCtrl'
    })
    .when('/drafts', {
      templateUrl: 'templates/drafts.html',
      controller: 'draftsCtrl'
    })
    .when('/schedules', {
      templateUrl: 'templates/schedules.html',
      controller: 'schedulesCtrl'
    })
    .when('/gallery', {
      templateUrl: 'templates/gallery.html',
      controller: 'galleryCtrl'
    })
    .when('/:account/transfer', {
      templateUrl: 'templates/transfer.html',
      controller: 'transferCtrl'
    })
    .when('/:account/transfer/:mode', {
      templateUrl: 'templates/transfer.html',
      controller: 'transferCtrl'
    })
    .when('/:account/transfer/:mode', {
      templateUrl: 'templates/transfer.html',
      controller: 'transferCtrl'
    })
    .when('/:account/escrow', {
      templateUrl: 'templates/escrow.html',
      controller: 'escrowCtrl'
    })
    .when('/:account/escrow-actions', {
      templateUrl: 'templates/escrow-actions.html',
      controller: 'escrowActionsCtrl'
    })
    .when('/:account/power-up', {
      templateUrl: 'templates/power-up.html',
      controller: 'powerUpCtrl'
    })
    .when('/:account/power-down', {
      templateUrl: 'templates/power-down.html',
      controller: 'powerDownCtrl'
    })
    .when('/welcome', {
      templateUrl: 'templates/welcome.html',
      controller: 'welcomeCtrl'
    })
    .when('/pin-create', {
      templateUrl: 'templates/pin-create.html',
      controller: 'pinCreateCtrl'
    })
    .when('/witnesses', {
      templateUrl: 'templates/witnesses.html',
      controller: 'witnessesCtrl'
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
  .factory('appVersion', () => {
    return version;
  })
  .factory('steemApi', () => {
    return {
      getApi: () => {
        return steem.api;
      },
      setServer: (u) => {
        steem.api.stop();
        steem.api.setOptions({url: u});
      }
    }
  })
  .factory('eSteemService', eSteemService)
  .factory('steemService', steemService)
  .factory('steemAuthenticatedService', steemAuthenticatedService)
  .factory('storageService', storageService)
  .factory('settingsService', settingsService)
  .factory('userService', userService)
  .factory('helperService', helperService)
  .factory('editorService', editorService)
  .factory('activeUsername', ($rootScope) => {
    return () => {
      if ($rootScope.user) {
        return $rootScope.user.username
      }
      return null;
    };
  })
  .factory('activePostFilter', ($rootScope) => {
    return () => {
      return $rootScope.selectedFilter !== 'feed' ? $rootScope.selectedFilter : constants.defaultFilter;
    };
  })
  .factory('autoCancelTimeout', ($rootScope, $timeout) => {
    return (fn, delay) => {
      if ($rootScope.__timeouts === undefined) {
        $rootScope.__timeouts = {};
      }

      const identifier = String(fn).hashCode();

      if ($rootScope.__timeouts[identifier] !== undefined) {
        $timeout.cancel($rootScope.__timeouts[identifier]);
        $rootScope.__timeouts[identifier] = undefined;
      }

      $rootScope.__timeouts[identifier] = $timeout(() => {
        fn();
        $rootScope.__timeouts[identifier] = undefined;
      }, delay);
    }
  })
  .factory('cryptoService', cryptoService)
  .factory('pinService', pinService)

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
  .directive('contentEditor', contentEditorDir)
  .directive('contentEditorControls', contentEditorControlsDir)
  .directive('fallbackSrc', fallbackSrcDir)
  .directive('contentListItemSearch', contentListItemSearchDir)
  .directive('commentEditor', commentEditorDir)
  .directive('draftListItem', draftListItemDir)
  .directive('scheduleListItem', scheduleListItemDir)
  .directive('galleryListItem', galleryListItemDir)
  .directive('transferNavBar', transferNavBarDir)
  .directive('contentListLoadingItem', contentListLoadingItemDir)
  .directive('showBgImageOnModal', showBgImageOnModalDir)

  .controller('postsCtrl', postsCtrl)
  .controller('settingsCtrl', settingsCtrl)
  .controller('loginCtrl', loginCtrl)
  .controller('contentVotersCtrl', contentVotersCtrl)
  .controller('postCtrl', postCtrl)
  .controller('authorCtrl', authorCtrl)
  .controller('tokenExchangeCtrl', tokenExchangeCtrl)
  .controller('discoverCtrl', discoverCtrl)
  .controller('marketPlaceCtrl', marketPlaceCtrl)
  .controller('feedCtrl', feedCtrl)
  .controller('bookmarksCtrl', bookmarksCtrl)
  .controller('tagsCtrl', tagsCtrl)
  .controller('editorCtrl', editorCtrl)
  .controller('searchCtrl', searchCtrl)
  .controller('draftsCtrl', draftsCtrl)
  .controller('schedulesCtrl', schedulesCtrl)
  .controller('galleryCtrl', galleryCtrl)
  .controller('transferCtrl', transferCtrl)
  .controller('escrowCtrl', escrowCtrl)
  .controller('escrowActionsCtrl', escrowActionsCtrl)
  .controller('powerUpCtrl', powerUpCtrl)
  .controller('powerDownCtrl', powerDownCtrl)
  .controller('addWithDrawAccountCtrl', addWithDrawAccountCtrl)
  .controller('profileEditCtrl', profileEditCtrl)
  .controller('welcomeCtrl', welcomeCtrl)
  .controller('pinCreateCtrl', pinCreateCtrl)
  .controller('pinDialogCtrl', pinDialogCtrl)
  .controller('favoritesCtrl', favoritesCtrl)
  .controller('followersCtrl', followersCtrl)
  .controller('followingCtrl', followingCtrl)
  .controller('witnessesCtrl', witnessesCtrl)


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
  .filter('__', ($sce) => {
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
          return 'Page';
        case 'COMMENT_SORT_ORDER':
          return 'Sort Order';
        case 'COMMENT_SORT_ORDER_TRENDING':
          return 'Trending';
        case 'COMMENT_SORT_ORDER_AUTHOR_REPUTATION':
          return 'Reputation';
        case 'COMMENT_SORT_ORDER_VOTES':
          return 'Votes';
        case 'COMMENT_SORT_ORDER_CREATED':
          return 'Age';
        case 'TOKEN_EXCHANGE':
          return 'Token Exchange';
        case 'DISCOVER':
          return 'Discover';
        case 'VOTING_POWER':
          return 'Voting Power';
        case 'POST_COUNT':
          return 'Post Count';
        case 'RESTEEMED':
          return 'resteemed';
        case 'RESTEEMED_BY':
          return 'resteemed by';
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
        case 'ACCOUNT':
          return 'Account';
        case 'LOGIN_AS':
          return 'Login As';
        case 'EMPTY_LIST':
          return 'Nothing here...';
        case 'SEARCH_BOOKMARKS':
          return 'Search in bookmarks...';
        case 'FILTER_TAGS':
          return 'Filter Tags';
        case 'SEARCH_RESULTS':
          return 'Results';
        case 'SEARCH_RESULTS_USER':
          return 'Users';
        case 'SCHEDULE_SUBMITTED':
          return 'Post scheduled';
        case 'EDITOR_MAX_TAGS_ERR':
          return 'Maximum 5 tags';
        case 'EDITOR_MAX_TAG_LENGTH_ERR':
          return 'Maximum tag length is 24 characters';
        case 'EDITOR_MAX_DASH_ERR':
          return 'Use only one dash';
        case 'EDITOR_SEPARATOR_ERR':
          return 'Use spaces to separate tags';
        case 'EDITOR_LOWERCASE_ERR':
          return 'Use only lowercase letters';
        case 'EDITOR_CHARS_ERR':
          return 'Use only lowercase letters, digits and one dash';
        case 'EDITOR_START_CHARS_ERR':
          return 'Must start with a letter';
        case 'EDITOR_END_CHARS_ERR':
          return 'Must end with a letter or number';
        case 'EDITOR_CLEAR':
          return 'Clear';
        case 'EDITOR_REMOVE_POSTING_PERM':
          return 'Remove Posting Permission';
        case 'EDITOR_GRANT_POSTING_PERM':
          return 'Grant Posting Permission';
        case 'EDITOR_SELECT_DATE':
          return 'Select date';
        case 'UPDATE':
          return 'Update';
        case 'POST_UPDATED':
          return 'Post is updated!';
        case 'EDITOR_TAG_PLACEHOLDER':
          return 'Tags. Max 5. Separate with space. The first tag is your main category.';
        case 'EDITOR_BODY_PLACEHOLDER':
          return 'Post Content';
        case 'EDITOR_TITLE_PLACEHOLDER':
          return 'Title';
        case 'EDITOR_CONTROL_BOLD':
          return 'Bold';
        case 'EDITOR_CONTROL_ITALIC':
          return 'Italic';
        case 'EDITOR_CONTROL_HEADER':
          return 'Header';
        case 'EDITOR_CONTROL_CODE':
          return 'Code';
        case 'EDITOR_CONTROL_QUOTE':
          return 'Quote';
        case 'EDITOR_CONTROL_OL':
          return 'Ordered List';
        case 'EDITOR_CONTROL_UL':
          return 'Unordered List';
        case 'EDITOR_CONTROL_HR':
          return 'Horizontal Rule';
        case 'EDITOR_CONTROL_IMAGE':
          return 'Image';
        case 'EDITOR_CONTROL_IMAGE_UPLOAD':
          return 'Upload';
        case 'EDITOR_CONTROL_IMAGE_GALLERY':
          return 'Gallery';
        case 'EDITOR_CONTROL_LINK':
          return 'Link';
        case 'SAVE':
          return 'Save';
        case 'REFRESH':
          return 'Refresh';
        case 'BALANCE':
          return 'Balance';
        case 'ACTIVE_KEY_REQUIRED_TRANSFER':
          return 'Active key could not found for selected account. Please make sure logged in with proper credentials.';
        case 'WRONG_AMOUNT_VALUE':
          return 'Wrong amount value';
        case 'AMOUNT_PRECISION_ERR':
          return 'Use only 3 digits of precision';
        case 'INSUFFICIENT_FUNDS':
          return 'Insufficient funds';
        case 'SAVINGS':
          return 'Savings';
        case 'PROFILE_SAVINGS_DESC':
          return 'Balance subject to 3 day withdraw waiting period.';
        case 'PROFILE_IMAGE_URL':
          return 'Profile picture url';
        case 'COVER_IMAGE_URL':
          return 'Cover image url';
        case 'ACCOUNT_PROFILE_UPDATED':
          return 'Profile updated!';
        case 'WITHDRAW_FROM_SAVINGS':
          return 'Withdraw from Savings';
        case 'DESTINATION_ACCOUNTS':
          return 'Destination Account(s)';
        case 'ADD_WITHDRAW_ACCOUNT':
          return 'Add Withdraw Account';
        case 'PERCENTAGE':
          return 'Percentage';
        case 'PERCENTAGE_DESC':
          return 'Percentage of Power Down to this account.';
        case 'AUTOMATICALLY_POWER_UP':
          return 'Automatically power up the target account';
        case 'DRAG_SLIDER':
          return 'Drag the slider to adjust the amount';
        case 'INCOMING_FUNDS':
          return 'Incoming Funds';
        case 'START_POWER_DOWN':
          return 'Begin Power Down';
        case 'STOP_POWER_DOWN':
          return 'Stop';
        case 'ESTIMATED_WEEKLY':
          return 'Estimated Weekly';
        case 'ESCROW_ACTIONS':
          return 'Escrow Actions';
        case 'ESCROW_ID':
          return 'Escrow ID';
        case 'ESCROW_NOT_FOUND':
          return 'Escrow not found';
        case 'FAQ':
          return 'FAQ';
        case 'VIA':
          return 'via';
        case 'WELCOME_NEXT':
          return 'Next';
        case 'WELCOME_PREV':
          return 'Prev';
        case 'WELCOME_START':
          return 'Start!';
        case 'PIN_CREATE':
          return 'Create pin code';
        case 'PIN_CREATE_TEXT':
          return $sce.trustAsHtml('Set pin code to encrypt your data and enable extra layer of security!<br>You will be promoted to enter pin code for crucial transactions as well as on every launch.');
        case 'PIN_CREATE_DESC':
          return '4 character pin code';
        case 'PIN_ENTER':
          return 'Enter Pin Code';
        case 'PIN_ENTER_DESC':
          return 'Enter pin code to continue';
        case 'PIN_ERROR_LAST_CHANCE':
          return ' This is your last chance';
        case 'PIN_INVALIDATE':
          return 'Invalidate Pin Code';
        case 'PIN_INVALIDATED':
          return 'Pin code invalidated';
        case 'ACTIVITIES':
          return 'Activities';
        case 'ACTIVITIES_VOTES':
          return 'Votes';
        case 'ACTIVITIES_REPLIES':
          return 'Replies';
        case 'ACTIVITIES_MENTIONS':
          return 'Mentions';
        case 'ACTIVITIES_FOLLOWS':
          return 'Follows';
        case 'ACTIVITIES_REBLOGS':
          return 'Reblogs';
        case 'ACTIVITIES_LEADEROARD':
          return 'Leaderboard';
        case 'ACTIVITIES_FOLLOWING':
          return 'following';
        case 'ACTIVITIES_UNFOLLOWED':
          return 'unfollowed';
        case 'FAVORITES':
          return 'Favorites';
        case 'FAVORITES_ADD':
          return 'Add to favorites';
        case 'FAVORITES_REMOVE':
          return 'Remove from favorites';
        case 'SEARCH_FAVORITES':
          return 'Search in favorites';
        case 'NEW_VERSION_ALERT_HEADER':
          return 'Warning';
        case 'NEW_VERSION_ALERT_TEXT':
          return $sce.trustAsHtml('There is a new version of eSteem Surfer. Please download the latest version from <a href="https://github.com/eSteemApp/esteem-surfer/releases" target="_external">https://github.com/eSteemApp/esteem-surfer/releases</a>');
        case 'LOAD_MORE':
          return 'Load more';
        default:
          return s;
      }
    }
  })

  .run(function ($rootScope, $uibModal, $routeParams, $translate, $timeout, $interval, $location, $window, $q, $http, eSteemService, steemService, settingsService, userService, activeUsername, activePostFilter, steemApi, pinService, constants, appVersion) {


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

    // Set steem api server address initially
    steemApi.setServer($rootScope.server);


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
      Path should not be root (there is a redirect rule for /), welcome page and pin creation page
      */
      if ($rootScope.lastVisitedPath && !$rootScope.isBack && ['/', '/welcome', '/pin-create'].indexOf($rootScope.lastVisitedPath) === -1) {
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
      let u = `/posts/${activePostFilter()}/${tag}`;
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

    // FAVORITES
    $rootScope.favorites = [];
    const fetchFavorites = () => {
      $rootScope.favorites = [];
      eSteemService.getFavorites($rootScope.user.username).then((resp) => {
        let temp = [];

        // Create timestamps and search titles for each bookmark item. Timestamps will be used for sorting.
        for (let i of resp.data) {
          temp.push(Object.assign(
            {},
            i,
            {searchTitle: `${i.account}`.toLowerCase()}
          ));
        }

        $rootScope.favorites = temp;
      });
    };

    if ($rootScope.user) {
      fetchFavorites();
    }

    // Fetch favorites on login
    $rootScope.$on('userLoggedIn', () => {
      fetchFavorites();
    });

    // Set favorites to empty list when user logged out
    $rootScope.$on('userLoggedOut', () => {
      $rootScope.favorites = [];
    });

    // Refresh favorites when new bookmark created
    $rootScope.$on('favoritesChanged', () => {
      fetchFavorites();
    });

    // SIDE TAG LIST
    $rootScope.sideTagFilter = false;
    $rootScope.sideAfterTag = '';

    // REPLYING/COMMENTING
    // This will help to persist user comments between transitions.
    $rootScope.commentEditorCache = {};

    // EDITOR
    $rootScope.editorDraft = null;

    // CONTENT UPDATING
    $rootScope.refreshContent = (c) => {
      $rootScope.$broadcast('CONTENT_REFRESH', {content: c});
    };

    $rootScope.$on('CONTENT_VOTED', (r, d) => {
      steemService.getContent(d.author, d.permlink).then(resp => {
        $rootScope.refreshContent(resp);
      });
    });

    // Update contents which are in navigation cache
    $rootScope.$on('CONTENT_REFRESH', (r, d) => {
      for (let navKey in cacheData) {
        for (let i of ['posts', 'feed', 'dataList']) {
          if (cacheData[navKey][i] !== undefined) {
            for (let k in cacheData[navKey][i]) {
              if (cacheData[navKey][i][k].id === d.content.id) {
                cacheData[navKey][i][k] = d.content;
              }
            }
          }
        }
      }
    });

    // Delete post from local cache when updated to show latest version
    $rootScope.$on('CONTENT_UPDATED', (r, d) => {
      for (let navKey in cacheData) {
        if (cacheData[navKey]['post'] && cacheData[navKey]['post'].id === d.contentId) {
          cacheData[navKey] = null;
          break;
        }
      }
    });

    // PIN CODE
    $rootScope.pinCode = null;

    $rootScope.getPinCode = () => {
      if (!$rootScope.pinCode) {
        throw 'Pin code not found';
      }
      return $rootScope.pinCode;
    };

    $rootScope.pinDialogOpen = false;
    $rootScope.pinDialog = (cancelable = false) => {
      return $uibModal.open({
        templateUrl: 'templates/pin-dialog.html',
        controller: 'pinDialogCtrl',
        windowClass: 'pin-dialog-modal',
        backdrop: 'static',
        keyboard: false,
        resolve: {
          cancelable: () => {
            return cancelable;
          },
        }
      });
    };

    $interval(() => {
      const loc = $window.location.href.split('#!')[1];
      if (['/', '/welcome', '/pin-create'].indexOf(loc) !== -1) {
        return;
      }

      const h = pinService.getPinHash();
      if (!h) {
        $location.path('/');
      }

      if (!$rootScope.pinCode && !$rootScope.pinDialogOpen) {
        $rootScope.pinDialog().result.then((pinCode) => {
          $rootScope.pinCode = pinCode;
        });
      }
    }, 2000);


    // New version checker
    $rootScope.newVersion = null;
    $http.get(constants.versionCheckUrl).then((resp)=>{
      const newVer = resp.data.tag_name;
      if(newVer !== appVersion){
        $rootScope.newVersion = newVer;
      }
    });

    $rootScope.dismissNewVersion = () => {
      $rootScope.newVersion = null;
    };


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

    // Success messages
    $rootScope.successMessages = [];
    $rootScope.showSuccess = (message) => {
      $rootScope.successMessages.push({
        id: genRandom(),
        text: message
      });
      $timeout(() => {
        $rootScope.successMessages.shift();
      }, 5000)
    };

    $rootScope.curCtrl = null;
    $rootScope.$on('$routeChangeSuccess', function (e, cur, prev) {
      $rootScope.curCtrl = cur.$$route.controller;
    });

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
