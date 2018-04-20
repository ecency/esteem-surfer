# [eSteem Surfer][esteem_desktop] – Steem Desktop Client

This is the complete source code and the build instructions for the alpha version of the [Steem blockchain](https://steem.io/) desktop client **eSteem Surfer** founded by [Feruz M](https://steemit.com/@good-karma) and Lead Surfer [Talha](https://steemit.com/@talhasch), supported by [eSteem team](https://steemit.com/@esteemapp) and wast Steem community contibutors.

![Preview of eSteem Surfer](https://steemitimages.com/DQmdvV5Grh9LJiRk11bCTTH1xCqp7qwGKcQUBJXJVRdSbNs/git_profile_preview.png)

## What is already implemented

* Surfing your feed and trending/hot stuff
* Creating new posts
* Commenting
* Voting
* Reading replies
* Bookmarks synced with eSteem Mobile

## Supported systems

* Windows XP - Windows 10
* Mac OS X 10.6 - Mac OS X 10.11
* Ubuntu 12.04 - Ubuntu 16.04
* Fedora 22 - Fedora 24

## Build instructions

### Clone

```
$ git clone https://github.com/eSteemApp/esteem-surfer
$ cd esteem-surfer
```

### Install dependencies

> Make sure you have node.js and npm installed

> Make sure bower installed globally (npm install -g bower)

```
$ npm install
$ bower install
```

### Run in development mode

```
$ npm start
```

### Package

```
$ npm run release
```

### Test

(Tests are not implemented yet)

```
$ npm run test
```

[//]: # (LINKS)
[esteem_desktop]: https://esteem.ws
