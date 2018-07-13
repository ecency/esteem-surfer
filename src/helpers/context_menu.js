// This gives you default context menu (cut, copy, paste)
// in all input fields and textareas across your app.

import {remote, shell, clipboard} from "electron";

const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

const isAnyTextSelected = () => {
  return window.getSelection().toString() !== "";
};

const cut = new MenuItem({
  label: "Cut",
  click: () => {
    document.execCommand("cut");
  }
});

const copy = new MenuItem({
  label: "Copy",
  click: () => {
    document.execCommand("copy");
  }
});

const paste = new MenuItem({
  label: "Paste",
  click: () => {
    document.execCommand("paste");
  }
});

let imgUrlToOpen = '';
const imgOpen = new MenuItem({
  label: "Open image in browser",
  click: () => {
    shell.openExternal(imgUrlToOpen);
  }
});

const imgCopyUrl = new MenuItem({
  label: "Copy image url",
  click: () => {
    clipboard.writeText(imgUrlToOpen);
  }
});


let urlToCopy = '';
const urlCopyUrl = new MenuItem({
  label: "Copy url",
  click: () => {
    clipboard.writeText(urlToCopy);
  }
});

const normalMenu = new Menu();
normalMenu.append(copy);

const textEditingMenu = new Menu();
textEditingMenu.append(cut);
textEditingMenu.append(copy);
textEditingMenu.append(paste);

const imgMenu = new Menu();
imgMenu.append(imgOpen);
imgMenu.append(imgCopyUrl);

const urlCopyMenu = new Menu();
urlCopyMenu.append(urlCopyUrl);


document.addEventListener(
  "contextmenu",
  event => {

    if (event.target.className.indexOf('url-copy') !== -1) {
      urlToCopy = event.target.getAttribute('data-href');
      event.preventDefault();
      urlCopyMenu.popup(remote.getCurrentWindow());
      return;
    }

    switch (event.target.nodeName) {
      case "IMG":
        imgUrlToOpen = event.target.getAttribute('src');
        if (imgUrlToOpen.startsWith('https://')) {
          event.preventDefault();
          imgMenu.popup(remote.getCurrentWindow());
        }
        break;
      case "TEXTAREA":
      case "INPUT":
        event.preventDefault();
        textEditingMenu.popup(remote.getCurrentWindow());
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
