# [Esteem Desktop][esteem_desktop] – Hive Desktop Client

🎉 This is the complete source code and the build instructions of the [Hive blockchain](https://hive.io/) desktop client **Esteem Desktop** founded by [Feruz M](https://esteem.app/@good-karma) and Lead Surfer [Talha](https://esteem.app/@talhasch), supported by [Esteem team](https://esteem.app/@esteemapp) and vast Hive community contibutors.

![Preview of Esteem Desktop](https://img.esteem.app/utif67.jpg)

## What is already implemented

- Surfing your feed and trending/hot stuff
- Creating new posts
- Commenting
- Voting with any %
- Reading replies/comments/mentions
- Drafts `synced with Esteem Mobile`
- Post Schedules `synced with Esteem Mobile`
- Bookmarks `synced with Esteem Mobile`
- Favorites `synced with Esteem Mobile`
- Comments/Memo Encryption
- Night Mode (Dark Theme)
- Wallet Transfers
- Image Gallery
- Detailed Voters Info
- Witness Voting

More functions are coming!

## Supported systems

- Windows XP - Windows 10
- Mac OS X 10.6 - Mac OS X 10.15
- Ubuntu 12.04 - Ubuntu 19.10
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
