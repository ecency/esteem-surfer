# [eSteem Surfer 2][esteem_desktop] – Steem Desktop Client

🎉 This is the complete source code and the build instructions of the [Steem blockchain](https://steem.io/) desktop client **eSteem Surfer 2** founded by [Feruz M](https://steemit.com/@good-karma) and Lead Surfer [Talha](https://steemit.com/@talhasch), supported by [eSteem team](https://steemit.com/@esteemapp) and vast Steem community contibutors.

![Preview of eSteem Surfer](https://user-images.githubusercontent.com/1177676/48030022-b4614000-e147-11e8-8204-f7c4355a6ac7.png)

## What is already implemented

- Surfing your feed and trending/hot stuff
- Creating new posts
- Commenting
- Voting with any %
- Reading replies/comments/mentions
- Drafts `synced with eSteem Mobile`
- Post Schedules `synced with eSteem Mobile`
- Bookmarks `synced with eSteem Mobile`
- Favorites `synced with eSteem Mobile`
- Comments/Memo Encryption
- Night Mode (Dark Theme)
- Wallet Transfers
- Image Gallery
- Detailed Voters Info
- Witness Voting

More functions are coming!

## Supported systems

- Windows XP - Windows 10
- Mac OS X 10.6 - Mac OS X 10.14
- Ubuntu 12.04 - Ubuntu 18.04
- Fedora 22 - Fedora 24

## Build instructions

### Requirements

- node ^6.14.0 || ^8.10.0 || >=9.10.0
- yarn

### Clone

```
$ git clone https://github.com/eSteemApp/esteem-surfer
$ cd esteem-surfer
```

### Install dependencies

```
$ yarn
```

### Create a dummy config.js

This is for the backend server configuration. Actual server addresses are not needed for most functions.

```
$ cp app/config.example.js app/config.js
```

### Run in development mode

```
$ npm run dev
```

### Package

```
$ npm run package
```

### Test

```
$ npm run test
```

[//]: # 'LINKS'
[esteem_desktop]: https://esteem.app
