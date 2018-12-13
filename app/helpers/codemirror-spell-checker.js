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
    noSuggestText: 'No suggestions...'
  };

  CodeMirror.defineOption('spellChecker', false, function(cm, val, old) {
    if (val) {
      options = Object.assign({}, options, val);

      cm.on('change', () => {
        handleChange(cm);
      });

      cm.on('contextmenu', (cm, event) => {
        event.preventDefault();

        if (event.target.className.indexOf('CodeMirror-misspelled') !== -1) {
          if (menuVisible) {
            return;
          }
          createContentMenu(cm, event);
        }
      });

      cm.on('mousedown', () => {
        removeContentMenu();
      });
    }
  });

  function createContentMenu(cm, event) {
    const { target } = event;
    const word = target.innerText.trim();
    menuVisible = true;

    window
      .getSpellingCorrections(word)
      .then(suggestions => {
        if (suggestions && suggestions.length) {
          return suggestions.slice(0, 10).map(suggestion => {
            const item = document.createElement('div');
            item.classList.add('SpellMenu-Item');
            item.innerText = suggestion;
            item.onclick = () => {
              const from = {
                line: parseInt(target.getAttribute('data-from-line'), 10),
                ch: parseInt(target.getAttribute('data-from-ch'), 10)
              };

              const to = {
                line: parseInt(target.getAttribute('data-to-line'), 10),
                ch: parseInt(target.getAttribute('data-to-ch'), 10)
              };

              cm.replaceRange(suggestion, from, to);

              removeContentMenu();
            };
            return item;
          });
        }

        const item = document.createElement('div');
        item.classList.add('SpellMenu-Item-No-Suggestion');
        item.innerText = options.noSuggestText;
        return [item];
      })
      .then(contextItems => {
        const contextEl = document.createElement('div');

        const elLeft = event.clientX;
        const elTop = event.clientY;

        contextEl.setAttribute('id', 'spell-context-menu');
        contextEl.classList.add('CodeMirror-SpellMenu');
        contextEl.style.left = `${elLeft}px`;
        contextEl.style.top = `${elTop}px`;

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

  function removeContentMenu() {
    const contextMenu = document.querySelector('#spell-context-menu');
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

        return true;
      })

      // Trim all again
      .map(x => x.trim())

      // Eliminate empty ones
      .filter(x => x !== '');

    console.log(words);

    const misspelledWords = words.filter(w => window.isMisspelled(w));

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
