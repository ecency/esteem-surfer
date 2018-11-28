// This gives you default context menu (cut, copy, paste)
// in all input fields and textareas across your app.

import { remote, shell, clipboard } from 'electron';

import localeList from './locales';
import { getItem } from './helpers/storage';

const { Menu, MenuItem } = remote;

let locale = 'en-US';

const watchLocale = () => {
  locale = getItem('locale', 'en-US');
};

setInterval(watchLocale, 3000);

const isAnyTextSelected = () => window.getSelection().toString() !== '';

const getLocaleEntry = (parent, child) => {
  try {
    return localeList[locale][parent][child];
  } catch (e) {
    return '';
  }
};

const itemCut = () =>
  new MenuItem({
    label: getLocaleEntry('context-menu', 'cut'),
    click: () => {
      document.execCommand('cut');
    }
  });

const itemCopy = () =>
  new MenuItem({
    label: getLocaleEntry('context-menu', 'copy'),
    click: () => {
      document.execCommand('copy');
    }
  });

const itemPaste = () =>
  new MenuItem({
    label: getLocaleEntry('context-menu', 'paste'),
    click: () => {
      document.execCommand('paste');
    }
  });

let imgUrlToOpen = '';
const itemImgOpen = () =>
  new MenuItem({
    label: getLocaleEntry('context-menu', 'open-image-browser'),
    click: () => {
      shell.openExternal(imgUrlToOpen);
    }
  });

const itemImgCopyUrl = () =>
  new MenuItem({
    label: getLocaleEntry('context-menu', 'copy-image-url'),
    click: () => {
      clipboard.writeText(imgUrlToOpen);
    }
  });

const normalMenu = new Menu();
normalMenu.append(itemCopy());

const textEditMenu = () => {
  const menu = new Menu();
  menu.append(itemCut());
  menu.append(itemCopy());
  menu.append(itemPaste());

  return menu;
};

const imgMenu = () => {
  const menu = new Menu();
  menu.append(itemImgOpen());
  menu.append(itemImgCopyUrl());

  return menu;
};

document.addEventListener(
  'contextmenu',
  event => {
    // If clicked on code mirror instance
    if (
      event.path.some(
        e => e.className && e.className.indexOf('CodeMirror') !== -1
      )
    ) {
      event.preventDefault();
      textEditMenu().popup(remote.getCurrentWindow());
      return;
    }

    switch (event.target.nodeName) {
      case 'IMG':
        imgUrlToOpen = event.target.getAttribute('src');
        if (imgUrlToOpen.startsWith('https://')) {
          event.preventDefault();
          imgMenu().popup(remote.getCurrentWindow());
        }
        break;
      case 'TEXTAREA':
      case 'INPUT':
        event.preventDefault();
        textEditMenu().popup(remote.getCurrentWindow());
        break;
      default:
        if (isAnyTextSelected()) {
          event.preventDefault();
          normalMenu.popup(remote.getCurrentWindow());
        }
    }
  },
  false
);
