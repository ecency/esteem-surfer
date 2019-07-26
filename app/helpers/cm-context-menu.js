/* eslint-disable */

(function(mod) {
  mod(require('codemirror/lib/codemirror'));
})(function(CodeMirror) {
  'use strict';

  const maxSearchOccur = 10;
  let markers = [];
  let interv = null;
  let menuVisible = false;

  let options = {
    appendTo: 'body',
    cutText: 'Cut',
    copyText: 'Copy',
    pasteText: 'Paste',
    noSuggestText: 'No suggestions...'
  };

  CodeMirror.defineOption('cmContextMenu', false, function(cm, val, old) {
    if (val) {
      options = Object.assign({}, options, val);

      cm.on('change', () => {
        handleChange(cm);
      });

      cm.on('contextmenu', (cm, event) => {
        event.preventDefault();
        if (menuVisible) {
          return;
        }

        const suggest =
          event.target.className.indexOf('CodeMirror-misspelled') !== -1;
        createContextMenu(cm, event, suggest);
      });

      cm.on('mousedown', () => {
        removeContextMenu();
      });
    }
  });

  function createMenuItem(label, onClick = null) {
    const item = document.createElement('div');
    item.classList.add('ContextMenu-Item');
    item.innerText = label;

    if (onClick) item.onclick = onClick;

    return item;
  }

  function createContextMenu(cm, event, suggest) {
    const { target } = event;

    menuVisible = true;

    const selection = cm.getSelection();

    const contextEl = document.createElement('div');
    const elLeft = event.clientX;
    const elTop = event.clientY;

    contextEl.setAttribute('id', 'cm-context-menu');
    contextEl.classList.add('CodeMirror-ContextMenu');
    contextEl.style.left = `${elLeft}px`;
    contextEl.style.top = `${elTop}px`;

    // contextItems.forEach(x => contextEl.appendChild(x));
    document.querySelector(options.appendTo).appendChild(contextEl);

    // Check and reposition if context menu height exceeds window height
    const { bottom: cBottom } = contextEl.getBoundingClientRect();
    const { bottom: bBottom } = document.body.getBoundingClientRect();

    if (cBottom > bBottom) {
      const newTop = elTop - (cBottom - bBottom);
      contextEl.style.top = `${newTop}px`;
    }

    // Cut menu item
    const cutItem = createMenuItem(options.cutText, () => {
      const i = document.createElement('input');
      document.body.appendChild(i);
      i.value = selection;
      i.select();
      document.execCommand('copy');
      i.parentNode.removeChild(i);

      cm.replaceSelection('');
      removeContextMenu();
      cm.focus();
    });

    contextEl.appendChild(cutItem);

    // Copy menu item
    const copyItem = createMenuItem(options.copyText, () => {
      document.execCommand('copy');
      removeContextMenu();
      cm.focus();
    });

    contextEl.appendChild(copyItem);

    // Paste menu item
    contextEl.appendChild(
      createMenuItem(options.pasteText, () => {
        document.execCommand('paste');
        removeContextMenu();
        cm.focus();
      })
    );

    if (selection.length === 0) {
      cutItem.classList.add('disabled');
      copyItem.classList.add('disabled');
    }

    if (!suggest) {
      return;
    }

    // It must be only one word
    if (selection.indexOf(' ') !== -1) {
      return;
    }

    const word = target.innerText.trim();

    const sep = document.createElement('div');
    sep.classList.add('ContextMenu-Separator');
    contextEl.appendChild(sep);

    window
      .getSpellingCorrections(word)
      .then(suggestions => {
        if (suggestions && suggestions.length) {
          return suggestions.slice(0, 7).map(suggestion => {
            return createMenuItem(suggestion, () => {
              const from = {
                line: parseInt(target.getAttribute('data-from-line'), 10),
                ch: parseInt(target.getAttribute('data-from-ch'), 10)
              };

              const to = {
                line: parseInt(target.getAttribute('data-to-line'), 10),
                ch: parseInt(target.getAttribute('data-to-ch'), 10)
              };

              cm.replaceRange(suggestion, from, to);

              removeContextMenu();
            });
          });
        }

        const item = document.createElement('div');
        item.classList.add('ContextMenu-Item-No-Suggestion');
        item.innerText = options.noSuggestText;
        return [item];
      })
      .then(contextItems => {
        contextItems.forEach(x => contextEl.appendChild(x));
        document.querySelector(options.appendTo).appendChild(contextEl);

        // Check and reposition if context menu height exceeds window height
        const { bottom: cBottom } = contextEl.getBoundingClientRect();
        const { bottom: bBottom } = document.body.getBoundingClientRect();

        if (cBottom > bBottom) {
          const newTop = elTop - (cBottom - bBottom);
          contextEl.style.top = `${newTop}px`;
        }
      });
  }

  function removeContextMenu() {
    const contextMenu = document.querySelector('#cm-context-menu');
    if (contextMenu) contextMenu.parentNode.removeChild(contextMenu);
    menuVisible = false;
  }

  function handleChange(cm) {
    if (interv) {
      clearTimeout(interv);
    }

    interv = setTimeout(function() {
      checkCm(cm);
    }, 1000);
  }

  function checkCm(cm) {
    // Reset markers
    markers.forEach(marker => marker.clear());
    markers = [];

    // console.log(cm.getValue().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"“”’?–]/g, ' '))

    const words = cm
      .getValue()
      // Remove HTML tags
      .replace(/<[^>]*>/gm, '')

      // Remove images
      .replace(/\!\[(.*?)\][\[\(].*?[\]\)]/gm, '')

      // Remove inline links
      .replace(/\[(.*?)\][\[\(].*?[\]\)]/g, '')

      // Remove blockquotes
      .replace(/^\s{0,3}>\s?/g, '')

      // Remove emphasis (repeat the line to remove double emphasis)
      .replace(/([\*_]{1,3})(\S.*?\S{0,1})\1/g, '$2')
      .replace(/([\*_]{1,3})(\S.*?\S{0,1})\1/g, '$2')

      // Remove code blocks
      .replace(/(`{3,})(.*?)\1/gm, '$2')

      // Remove inline code
      .replace(/`(.+?)`/g, '$1')

      // Replace new lines with spaces
      .replace(/\n/g, ' ')

      // Remove all punctuation
      .replace(/[.,\/#!$%^&*;:{}=\-_`~()\[\]"“”?–…|]/g, ' ')

      // Split by spaces and tags
      .split(/\s|\t/gm)

      // Trim all
      .map(x => x.trim())

      // Extra filter for unwanted patterns
      .filter(w => {
        if (w.startsWith('http')) {
          return false;
        }

        // it may be a http link or short link
        if (w.includes('/')) {
          return false;
        }

        // Only numbers
        if (/^\d+$/.test(w)) {
          return false;
        }

        // User names
        if (w.startsWith('@')) {
          return false;
        }

        return true;
      })

      // Trim all again
      .map(x => x.trim())

      // Eliminate empty ones
      .filter(x => x !== '');

    const misspelledWords = words
      .filter(w => window.isMisspelled(w))

      // Max 20 spell check
      .splice(0, 20);

    misspelledWords.forEach(w => {
      const wordPositions = [];
      const cursor = cm.getSearchCursor(w, { line: 0, ch: 0 });

      let i = 0;
      while (true) {
        cursor.findNext();
        if (!cursor.atOccurrence) {
          break;
        }

        wordPositions.push(cursor.pos);

        i += 1;
        if (i === maxSearchOccur) {
          break;
        }
      }

      wordPositions.forEach(x => {
        markers.push(
          cm.markText(x.from, x.to, {
            className: 'CodeMirror-misspelled',
            attributes: {
              'data-from-line': x.from.line,
              'data-from-ch': x.from.ch,
              'data-to-line': x.to.line,
              'data-to-ch': x.to.ch
            }
          })
        );
      });
    });
  }
});
