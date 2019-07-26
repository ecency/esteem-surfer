import { remote, shell, clipboard } from 'electron';

import formatMessage from './utils/format-message';

const { Menu, MenuItem } = remote;

const isAnyTextSelected = () => window.getSelection().toString() !== '';

const itemCut = () =>
  new MenuItem({
    label: formatMessage('context-menu.cut'),
    click: () => {
      document.execCommand('cut');
    }
  });

const itemCopy = () =>
  new MenuItem({
    label: formatMessage('context-menu.copy'),
    click: () => {
      document.execCommand('copy');
    }
  });

const itemPaste = () =>
  new MenuItem({
    label: formatMessage('context-menu.paste'),
    click: () => {
      document.execCommand('paste');
    }
  });

let imgUrlToOpen = '';
const itemImgOpen = () =>
  new MenuItem({
    label: formatMessage('context-menu.open-image-browser'),
    click: () => {
      shell.openExternal(imgUrlToOpen);
    }
  });

const itemImgCopyUrl = () =>
  new MenuItem({
    label: formatMessage('context-menu.copy-image-url'),
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
    // Code mirror instances have their own context menu
    if (
      event.path.some(
        e => e.className && e.className.indexOf('CodeMirror') !== -1
      )
    ) {
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
