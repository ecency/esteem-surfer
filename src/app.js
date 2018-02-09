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

import {postsCtrl} from './controllers/posts';
import {faqCtrl} from './controllers/faq';
import {aboutCtrl} from './controllers/about'

import {navBarDir} from './directives/navbar';
import {footerDir} from './directives/footer';
import {postListItemDir} from "./directives/post-list-item";
import {sideTagListDir} from "./directives/side-tag-list";

import {discussionsService, tagsService} from "./services";

import constants from './constants';

angular.module('eSteem', ['ngRoute', 'pascalprecht.translate'])

  .config(($translateProvider, $routeProvider, $httpProvider) => {

    // Translations
    $translateProvider.translations('en-US', require('./locales/en-US')); //English

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
  .factory('steemApi', (constants) => {
    steem.api.setOptions({url: constants.defaultServer.url});
    return steem.api;
  })
  .factory('discussionsService', discussionsService)
  .factory('tagsService', tagsService)
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
});


window.onload = () => {
  setTimeout(() => {
    document.body.style.visibility = 'visible';
  }, 300);
};
