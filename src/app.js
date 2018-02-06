import "./stylesheets/app-light.scss";

// Disable zooming
const electron = require('electron');
electron.webFrame.setZoomLevelLimits(1, 1);

// Small helpers you might want to keep
import "./helpers/context_menu.js";
import "./helpers/external_links.js";

// ----------------------------------------------------------------------------
// Everything below is just to show you how it works. You can delete all of it.
// ----------------------------------------------------------------------------

import {remote} from "electron";
import jetpack from "fs-jetpack";
// import {greet} from "./hello_world/hello_world";
import env from "env";

const app = remote.app;
const appDir = jetpack.cwd(app.getAppPath());

// Holy crap! This is browser window with HTML and stuff, but I can read
// files from disk like it's node.js! Welcome to Electron world :)
const manifest = appDir.read("package.json", "json");

import angular from 'angular';
import * as angularRoute from 'angular-route';

import {homeCtrl} from './controllers/home';


const theApp = angular.module('eSteemDesktop', ['ngRoute'])
  .controller('homeCtrl', homeCtrl)
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/index.html',
        controller: 'homeCtrl'
      })
      .when('/contact', {
        templateUrl: 'contact/index.html',
        controller: 'contactCtrl',
      })
      .when('/faq', {
        templateUrl: 'faq/index.html',
        controller: 'FaqCtrl',
      })
      .when('/posts/:postId', {
        templateUrl: 'views/post.html',
        controller: 'PostCtrl'
      })
      .otherwise({redirectTo: '/'});
  }).config(function ($httpProvider) {
    // Prevent $http caching
    if (!$httpProvider.defaults.headers.get) {
      $httpProvider.defaults.headers.get = {};
    }
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
  });


window.onload = () => {
  setTimeout(function () {
    document.getElementById('root').style.visibility = 'visible';
  }, 300);
};
