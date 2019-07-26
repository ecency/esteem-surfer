/*
eslint-disable react/no-multi-comp, no-underscore-dangle
*/

import React, { Component, Fragment } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';

import { UnControlled as CodeMirror } from 'react-codemirror2';
import { Input, Select, message } from 'antd';

import { renderPostBody } from '@esteemapp/esteem-render-helpers';

import Tooltip from '../common/Tooltip';

import GalleryModal from '../dialogs/Gallery';

import { uploadImage, addMyImage } from '../../backend/esteem-client';

import { getItem, setItem } from '../../helpers/storage';

import emojiData from '../../data/emoji';

require('codemirror/addon/display/placeholder.js');
require('codemirror/addon/search/searchcursor.js');
require('codemirror/addon/search/match-highlighter.js');
require('codemirror/mode/markdown/markdown');
require('../../helpers/cm-context-menu.js');

const emojiFilterCache = Object.keys(emojiData.emojis).map(e => {
  const em = emojiData.emojis[e];
  return {
    id: e,
    name: em.a.toLowerCase(),
    keywords: em.j ? em.j : []
  };
});

class EmojiPicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filterKey: ''
    };
  }

  renderEmoji = emoji => {
    const em = emojiData.emojis[emoji];
    if (!em) {
      return null;
    }
    const unicodes = em.b.split('-');
    const codePoints = unicodes.map(u => `0x${u}`);
    const native = String.fromCodePoint(...codePoints);

    return (
      <div
        onClick={() => {
          this.clicked(emoji, native);
        }}
        key={emoji}
        role="none"
        className="emoji"
        title={em.a}
      >
        {native}
      </div>
    );
  };

  filterKeyChanged = e => {
    this.setState({ filterKey: e.target.value });
  };

  clicked = (id, native) => {
    const recent = getItem('recent-emoji', []);
    if (!recent.includes(id)) {
      const newRecent = [...new Set([id, ...recent])].slice(0, 18);
      setItem('recent-emoji', newRecent);
    }

    const { onClick } = this.props;
    onClick(native);
  };

  render() {
    const { intl } = this.props;

    const recent = getItem('recent-emoji', []);

    const { filterKey } = this.state;
    let filterResults;
    if (filterKey) {
      filterResults = emojiFilterCache
        .filter(
          i =>
            i.id.indexOf(filterKey) !== -1 ||
            i.name.indexOf(filterKey) !== -1 ||
            i.keywords.includes(filterKey)
        )
        .map(i => i.id);
    }

    return (
      <div className="emoji-picker">
        <div className="search-box">
          <Input
            placeholder={intl.formatMessage({
              id: 'composer.emoji-filter-placeholder'
            })}
            value={filterKey}
            onChange={this.filterKeyChanged}
          />
        </div>

        {!filterKey && (
          <div className="emoji-cat-list">
            {recent.length > 0 && (
              <div className="emoji-cat">
                <div className="cat-title">
                  <FormattedMessage id="composer.emoji-recently-used" />
                </div>
                <div className="emoji-list">
                  {recent.map(emoji => this.renderEmoji(emoji))}
                </div>
              </div>
            )}
            {emojiData.categories.map(cat => (
              <div className="emoji-cat" key={cat.id}>
                <div className="cat-title">{cat.name}</div>
                <div className="emoji-list">
                  {cat.emojis.map(emoji => this.renderEmoji(emoji))}
                </div>
              </div>
            ))}
          </div>
        )}

        {filterKey && (
          <div className="emoji-cat-list">
            <div className="emoji-cat">
              <div className="emoji-list">
                {filterResults.length === 0 && (
                  <FormattedMessage id="composer.emoji-filter-no-match" />
                )}
                {filterResults.length > 0 &&
                  filterResults.map(emoji => this.renderEmoji(emoji))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

EmojiPicker.defaultProps = {
  onClick: () => {}
};

EmojiPicker.propTypes = {
  onClick: PropTypes.func,
  intl: PropTypes.instanceOf(Object).isRequired
};

class Editor extends Component {
  constructor(props) {
    super(props);

    const { defaultValues } = this.props;

    this.state = {
      title: defaultValues.title,
      tags: defaultValues.tags,
      body: defaultValues.body,
      galleryModalVisible: false
    };

    this.editorInstance = null;

    this.ignoreEditorScroll = false;
    this.ignoreSyncElScroll = false;

    this.strWidgetCache = '';
  }

  componentDidMount() {
    this.syncTimer = setInterval(this.syncHeights, 1000);
    this.widgetTimer = setInterval(this.setWidgets, 1000);

    const { syncWith } = this.props;
    if (syncWith) {
      document
        .querySelector(syncWith)
        .addEventListener('scroll', this.onSyncElScroll);

      setTimeout(this.setWidgets, 500);
    }

    document
      .getElementById('file-input')
      .addEventListener('change', this.handleFileInput);
  }

  componentWillUnmount() {
    clearInterval(this.syncTimer);
    clearInterval(this.widgetTimer);

    const { syncWith } = this.props;
    if (syncWith) {
      document
        .querySelector(syncWith)
        .removeEventListener('scroll', this.onSyncElScroll);
    }

    document
      .getElementById('file-input')
      .removeEventListener('change', this.handleFileInput);
  }

  clear = (cb = null) => {
    this.setState(
      {
        title: '',
        tags: [],
        body: ''
      },
      () => {
        this.changed();
        if (cb) cb();
      }
    );

    // binding code mirror to state variable is troublesome. manually set code mirror value.
    this.editorInstance.setValue('');
  };

  changed = () => {
    const { onChange } = this.props;
    const { title, tags, body } = this.state;

    onChange({ title, tags, body });
  };

  titleChanged = e => {
    this.setState({ title: e.target.value }, () => this.changed());
  };

  tagsChanged = e => {
    const tags = [...e].map(x => x.trim().toLowerCase());
    this.setState({ tags }, () => this.changed());
  };

  bodyChanged = (editor, data, value) => {
    if (this.changeTimer) {
      clearTimeout(this.changeTimer);
    }

    this.changeTimer = setTimeout(() => {
      this.setState({ body: value }, () => this.changed());
    }, 500);

    // If last line editing, scroll snyc element to bottom
    const { syncWith } = this.props;
    if (!syncWith) return;

    const lineCount = editor.lineCount();
    const lineNo = editor.getCursor();

    if (lineCount === lineNo.line + 1) {
      setTimeout(() => {
        const s = document.querySelector(syncWith);
        this.ignoreEditorScroll = true;
        s.scrollTop = s.scrollHeight;
      }, 300);
    }
  };

  getEditorInstance = () => this.editorInstance;

  insertInline = (before = '', after = '') => {
    const editor = this.getEditorInstance();
    const selection = editor.getSelection();

    editor.replaceSelection(`${before}${selection}${after}`);

    const { line, ch } = editor.getCursor();
    const newCh = ch - after.length;

    editor.setCursor(line, newCh);
    editor.focus();
  };

  insertBlock = contents => {
    const editor = this.getEditorInstance();

    const curCursor = editor.getCursor();
    const curLine = editor.getLine(curCursor.line);

    let before = '';
    const after = `\n`;

    // add new line if document not empty
    if (curLine) {
      before = `\n`;
    }

    const selection = editor.getSelection();
    editor.replaceSelection(`${before}${selection}${contents}${after}`);

    editor.focus();
  };

  replaceRange = (search, replace) => {
    const editor = this.getEditorInstance();
    const searchCursor = editor.getSearchCursor(search, { line: 0, ch: 0 });
    searchCursor.findNext();

    if (!searchCursor.atOccurrence) {
      return false;
    }

    const { from, to } = searchCursor.pos;
    editor.replaceRange(replace, from, to);

    return true;
  };

  bold = () => {
    this.insertInline('**', '**');
  };

  italic = () => {
    this.insertInline('*', '*');
  };

  header = (w = 1) => {
    const h = '#'.repeat(w);
    this.insertInline(`${h} `);
  };

  code = () => {
    this.insertInline('<code>', '</code>');
  };

  quote = () => {
    this.insertInline('>');
  };

  olList = () => {
    this.insertBlock('1. item1\n2. item2\n3. item3');
  };

  ulList = () => {
    this.insertBlock('* item1\n* item2\n* item3');
  };

  table = e => {
    e.stopPropagation();

    const t =
      '' +
      '|\tColumn 1\t|\tColumn 2\t|\tColumn 3\t|\n' +
      '|\t--------\t|\t--------\t|\t--------\t|\n' +
      '|\t  Text  \t|\t  Text  \t|\t  Text  \t|';
    this.insertBlock(t);
  };

  table2 = e => {
    e.stopPropagation();

    const t =
      '' +
      '|\tColumn 1\t|\tColumn 2\t|\n' +
      '|\t--------\t|\t--------\t|\n' +
      '|\t  Text  \t|\t  Text  \t|';
    this.insertBlock(t);
  };

  table1 = e => {
    e.stopPropagation();

    const t = '|\tColumn 1\t|\n|\t--------\t|\n|\t  Text  \t|';
    this.insertBlock(t);
  };

  link = () => {
    this.insertInline('[', '](url)');
  };

  image = (name = '', url = 'url') => {
    this.insertInline(`![${name}`, `](${url})`);
  };

  onKeyDown = (editor, event) => {
    // Shortcut for **bold**
    if (event.keyCode === 66 && (event.ctrlKey || event.metaKey)) {
      this.bold();
      event.preventDefault();
    }

    // Shortcut for *italic*
    if (event.keyCode === 73 && (event.ctrlKey || event.metaKey)) {
      this.italic();
      event.preventDefault();
    }
  };

  onDragEnter = (editor, event) => {
    event.stopPropagation();
    event.preventDefault();
  };

  onDragLeave = (editor, event) => {
    event.stopPropagation();
    event.preventDefault();
  };

  onDragOver = (editor, event) => {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy'; // eslint-disable-line no-param-reassign
  };

  onDrop = (editor, event) => {
    event.stopPropagation();
    event.preventDefault();

    const files = [...event.dataTransfer.files]
      .map(item => (this.checkFile(item.name) ? item : null))
      .filter(i => i);

    if (files.length > 0) {
      event.stopPropagation();
      event.preventDefault();
    }

    files.forEach(file => this.upload(file));
  };

  handleFileInput = event => {
    const files = [...event.target.files]
      .map(item => (this.checkFile(item.name) ? item : null))
      .filter(i => i);

    if (files.length > 0) {
      event.stopPropagation();
      event.preventDefault();
    }

    files.forEach(file => this.upload(file));
  };

  onPaste = (editor, event) => {
    // when text copied from ms word, it adds screen shot of selected text to clipboard.
    // check if data in clipboard is long string and skip upload.
    // (i think no one uses more than 50 chars for a image file)
    const txtData = event.clipboardData.getData('text/plain');
    if (txtData.length >= 50) {
      return;
    }

    const files = [...event.clipboardData.items]
      .map(item =>
        item.type.indexOf('image') !== -1 ? item.getAsFile() : null
      )
      .filter(i => i);

    if (files.length > 0) {
      event.stopPropagation();
      event.preventDefault();
    }

    files.forEach(file => this.upload(file));
  };

  checkFile = filename => {
    const filenameLow = filename.toLowerCase();
    return ['jpg', 'jpeg', 'gif', 'png'].some(el => filenameLow.endsWith(el));
  };

  upload = async file => {
    const tempImgTag = `![Uploading ${file.name} #${Math.floor(
      Math.random() * 99
    )}]()`;
    this.insertBlock(tempImgTag);

    let uploadResp;
    try {
      uploadResp = await uploadImage(file).then(resp => resp.data);
    } catch (e) {
      message.error('Could not upload image');
      this.replaceRange(tempImgTag, '');
      return;
    }

    const { url: imageUrl } = uploadResp;
    const imageName = imageUrl.split('/').pop();

    const imgTag = `![${imageName}](${imageUrl})`;

    this.replaceRange(tempImgTag, imgTag);

    const { activeAccount } = this.props;
    if (activeAccount) {
      addMyImage(activeAccount.username, imageUrl);
    }
  };

  onScroll = (editor, data) => {
    if (!this.syncScrollEnabled()) {
      return;
    }

    const { syncWith } = this.props;

    if (this.ignoreSyncElScroll) {
      this.ignoreSyncElScroll = false;
      return;
    }

    this.ignoreEditorScroll = true;

    document.querySelector(syncWith).scrollTop = data.top;
  };

  onSyncElScroll = e => {
    if (!this.syncScrollEnabled()) {
      return;
    }

    if (this.ignoreEditorScroll) {
      this.ignoreEditorScroll = false;
      return;
    }

    this.ignoreSyncElScroll = true;
    this.editorInstance.scrollTo(0, e.target.scrollTop);
  };

  setWidgets = () => {
    const editor = this.getEditorInstance();

    if (!editor) {
      return;
    }

    if (!this.syncScrollEnabled()) {
      const lines = [...Array(editor.lineCount()).keys()];

      lines.forEach(line => {
        const lineH = editor.getLineHandle(line);

        // delete
        if (lineH.widgets) {
          editor.removeLineWidget(lineH.widgets[0]);
        }
      });
      return;
    }

    const widgetMap = [];

    const info = editor.getScrollInfo();
    const editorWidth = info.width;

    const lines = [...Array(editor.lineCount()).keys()];

    lines.forEach(line => {
      // console.log(editor.getLineHandle(line))

      const lineVal = editor.getLine(line);
      const lineValLow = lineVal.toLowerCase();

      // If line doesnt contains img, iframe, or link dont waste time
      if (
        !lineValLow.match(
          /<img[^>]+>(<\/img>)?|<iframe.+?<\/iframe>|!\[.*\)|(https?:(.*))/g
        )
      ) {
        return;
      }

      const lineHtml = renderPostBody(lineVal);

      // Real wrapper
      const wrapper = document.createElement('div');
      wrapper.classList.add('compare-helper');

      wrapper.innerHTML = `<div class="markdown-view">${lineHtml}</div>`;
      wrapper.style.width = `${editorWidth}px`;
      document.body.appendChild(wrapper);

      // Plain wrapper for comparing after deleted img and iframes
      const plainWrapper = document.createElement('div');
      plainWrapper.classList.add('compare-helper');

      plainWrapper.innerHTML = `<div class="markdown-view">${lineHtml}</div>`;
      plainWrapper.style.width = `${editorWidth}px`;

      plainWrapper
        .querySelectorAll('img,iframe,.markdown-video-link')
        .forEach(el => {
          el.parentNode.removeChild(el);
        });

      document.body.appendChild(plainWrapper);

      const diff = wrapper.clientHeight - plainWrapper.clientHeight;

      document.body.removeChild(plainWrapper);

      if (diff === 0) {
        document.body.removeChild(wrapper);
        return;
      }

      const elMap = [];
      let elKey = ' ';

      wrapper.querySelectorAll('img,iframe').forEach(el => {
        const src = el.getAttribute('src');
        const style = window.getComputedStyle(el);
        const width = parseInt(style.getPropertyValue('width'), 10);
        const height = parseInt(style.getPropertyValue('height'), 10);

        // console.log(src);
        // console.log(`${width} x ${height} `);
        // console.log('--------------');

        if (width && height) {
          elKey += encodeURIComponent(src);

          elMap.push({
            type: el.tagName.toLowerCase(),
            width,
            height,
            src
          });
        }
      });

      if (elMap.length) {
        widgetMap.push({
          line,
          diff,
          elements: elMap,
          key: elKey
        });
      }
    });

    // delete widgets
    const wLines = widgetMap.map(w => w.line);

    lines.forEach(line => {
      const lineH = editor.getLineHandle(line);

      // delete
      if (lineH.widgets && !wLines.includes(line)) {
        editor.removeLineWidget(lineH.widgets[0]);
      }
    });

    widgetMap.forEach(item => {
      const { line, diff: height, elements, key } = item;

      const lineH = editor.getLineHandle(line);

      if (lineH.widgets) {
        const curKey = lineH.widgets[0].node.querySelector('.key').value;
        if (curKey === key) {
          return;
        }

        editor.removeLineWidget(lineH.widgets[0]);
      }

      const wElem = document.createElement('div');
      wElem.classList.add('editor-widget');
      wElem.style.height = `${height}px`;

      const inner = elements
        .map(el => {
          if (el.type === 'img') {
            return `<img src="${el.src}" />`;
          }

          if (el.type === 'iframe') {
            return '<div class="iframe-embed"><i class="mi">play_circle_outline</i></div>';
          }
          return '';
        })
        .join(' ');

      wElem.innerHTML = `<input type="hidden" class="key" value="${key}" /> ${inner}`;

      editor.addLineWidget(line, wElem, {});
    });
  };

  syncHeights = () => {
    if (!this.syncScrollEnabled()) {
      return;
    }

    const { syncWith } = this.props;
    if (!syncWith) {
      return;
    }

    const editorEl = document.querySelector('.editor-form .CodeMirror-lines');
    const editorElBottomPad = parseInt(editorEl.style.paddingBottom, 10) || 0;
    const editorElHeight = editorEl.scrollHeight - editorElBottomPad;

    const syncEl = document.querySelector(syncWith);
    const syncElementHeight = syncEl.scrollHeight;
    const syncElHasScroll = syncElementHeight > syncEl.clientHeight;

    let newPad = 0;

    if (syncElHasScroll && syncElementHeight > editorElHeight) {
      newPad = syncElementHeight - editorElHeight + 100;
    }

    if (editorElBottomPad === newPad) {
      return;
    }

    editorEl.style.paddingBottom = `${newPad}px`;

    this.editorInstance.setSize('100%', '100%');
  };

  syncScrollEnabled = () => {
    const { syncWith } = this.props;
    if (!syncWith) {
      return;
    }

    return getItem('compose-sync', false);
  };

  onEmojiSelected = em => {
    const { activeInput } = this.state;
    if (activeInput === 'title') {
      const titleEl = document.querySelector('#editor-title');
      if (titleEl) {
        const { title } = this.state;

        let pos = titleEl.selectionStart;

        const chars = [...title];
        chars.splice(pos, 0, em);

        const newTitle = chars.join('');

        pos += 1;

        this.setState({ title: newTitle }, () => {
          titleEl.selectionStart = pos + 1;
          titleEl.selectionEnd = pos + 2;
          titleEl.focus();
          this.changed();
        });
        return;
      }
    }
    this.insertInline(`${em} `);
  };

  render() {
    const {
      defaultValues,
      trendingTags,
      activeAccount,
      mode,
      bodyPlaceHolder,
      intl
    } = this.props;
    const { galleryModalVisible, tags, title } = this.state;

    const tagOptions = trendingTags.list.map(tag => (
      <Select.Option key={tag}>{tag}</Select.Option>
    ));

    const toolbar = (
      <div className="editor-toolbar">
        <Tooltip
          title={intl.formatMessage({ id: 'composer.tool-bold' })}
          mouseEnterDelay={2}
        >
          <div className="editor-tool" onClick={this.bold} role="none">
            <i className="mi tool-icon">format_bold</i>
          </div>
        </Tooltip>
        <Tooltip
          title={intl.formatMessage({ id: 'composer.tool-italic' })}
          mouseEnterDelay={2}
        >
          <div className="editor-tool" onClick={this.italic} role="none">
            <i className="mi tool-icon">format_italic</i>
          </div>
        </Tooltip>
        <Tooltip
          title={intl.formatMessage({ id: 'composer.tool-header' })}
          mouseEnterDelay={2}
        >
          <div
            className="editor-tool"
            onClick={() => {
              this.header(1);
            }}
            role="none"
          >
            <i className="mi tool-icon">title</i>
            <div className="sub-tool-menu">
              {[...Array(3).keys()].map(i => (
                <div
                  key={i}
                  className="sub-tool-menu-item"
                  role="none"
                  onClick={event => {
                    event.stopPropagation();
                    this.header(i + 2);
                  }}
                >
                  {' '}
                  {`H${i + 2}`}
                </div>
              ))}
            </div>
          </div>
        </Tooltip>
        <div className="tool-separator" />
        <Tooltip
          title={intl.formatMessage({ id: 'composer.tool-code' })}
          mouseEnterDelay={2}
        >
          <div className="editor-tool" onClick={this.code} role="none">
            <i className="mi tool-icon">code</i>
          </div>
        </Tooltip>
        <Tooltip
          title={intl.formatMessage({ id: 'composer.tool-quote' })}
          mouseEnterDelay={2}
        >
          <div className="editor-tool" onClick={this.quote} role="none">
            <i className="mi tool-icon">format_quote</i>
          </div>
        </Tooltip>
        <div className="tool-separator" />
        <Tooltip
          title={intl.formatMessage({ id: 'composer.tool-ol' })}
          mouseEnterDelay={2}
        >
          <div className="editor-tool" onClick={this.olList} role="none">
            <i className="mi tool-icon">format_list_numbered</i>
          </div>
        </Tooltip>
        <Tooltip
          title={intl.formatMessage({ id: 'composer.tool-ul' })}
          mouseEnterDelay={2}
        >
          <div className="editor-tool" onClick={this.ulList} role="none">
            <i className="mi tool-icon">format_list_bulleted</i>
          </div>
        </Tooltip>
        <div className="tool-separator" />
        <Tooltip
          title={intl.formatMessage({ id: 'composer.tool-link' })}
          mouseEnterDelay={2}
        >
          <div className="editor-tool" onClick={this.link} role="none">
            <i className="mi tool-icon">link</i>
          </div>
        </Tooltip>
        <Tooltip
          title={intl.formatMessage({ id: 'composer.tool-image' })}
          mouseEnterDelay={2}
        >
          <div
            className="editor-tool"
            onClick={() => {
              this.image();
            }}
            role="none"
          >
            <i className="mi tool-icon">image</i>
            <div className="sub-tool-menu">
              <div
                className="sub-tool-menu-item"
                role="none"
                onClick={event => {
                  event.stopPropagation();
                  document.getElementById('file-input').click();
                }}
              >
                <FormattedMessage id="composer.tool-upload" />
              </div>
              {activeAccount && (
                <div
                  className="sub-tool-menu-item"
                  role="none"
                  onClick={event => {
                    event.stopPropagation();
                    this.setState({ galleryModalVisible: true });
                  }}
                >
                  <FormattedMessage id="composer.tool-gallery" />
                </div>
              )}
            </div>
          </div>
        </Tooltip>
        <Tooltip
          title={intl.formatMessage({ id: 'composer.tool-table' })}
          mouseEnterDelay={2}
        >
          <div className="editor-tool" onClick={this.table} role="none">
            <i className="mi tool-icon">grid_on</i>
            <div className="sub-tool-menu">
              <div
                className="sub-tool-menu-item"
                role="none"
                onClick={this.table}
              >
                <FormattedMessage id="composer.tool-table-3-col" />
              </div>
              <div
                className="sub-tool-menu-item"
                role="none"
                onClick={this.table2}
              >
                <FormattedMessage id="composer.tool-table-2-col" />
              </div>
              <div
                className="sub-tool-menu-item"
                role="none"
                onClick={this.table1}
              >
                <FormattedMessage id="composer.tool-table-1-col" />
              </div>
            </div>
          </div>
        </Tooltip>
        <Tooltip
          title={intl.formatMessage({ id: 'composer.tool-emoji' })}
          mouseEnterDelay={2}
        >
          <div className="editor-tool" role="none">
            <i className="mi tool-icon">sentiment_satisfied</i>
            <EmojiPicker {...this.props} onClick={this.onEmojiSelected} />
          </div>
        </Tooltip>
      </div>
    );

    const editorOptions = {
      mode: 'markdown',
      theme: 'day',
      lineWrapping: true,
      tabSize: 2,
      dragDrop: true,
      placeholder: bodyPlaceHolder,
      highlightSelectionMatches: { wordsOnly: true },
      cmContextMenu: {
        appendTo: '#root .wrapper',
        cutText: intl.formatMessage({ id: 'context-menu.cut' }),
        copyText: intl.formatMessage({ id: 'context-menu.copy' }),
        pasteText: intl.formatMessage({ id: 'context-menu.paste' }),
        noSuggestText: intl.formatMessage({ id: 'composer.no-suggestions' })
      }
      // cursorScrollMargin: 400
    };

    return (
      <div className={`editor-form ${mode}-editor`}>
        {toolbar}
        {mode === 'post' && (
          <Fragment>
            <div className="title-input">
              <Input
                type="text"
                placeholder={intl.formatMessage({
                  id: 'composer.title-placeholder'
                })}
                autoFocus
                onChange={this.titleChanged}
                defaultValue={defaultValues.title}
                value={title}
                onFocus={() => {
                  this.setState({ activeInput: 'title' });
                }}
                id="editor-title"
              />
            </div>
            <div className="tags-input">
              <Select
                mode="tags"
                placeholder={intl.formatMessage({
                  id: 'composer.tags-placeholder'
                })}
                maxTagCount={5}
                maxTagPlaceholder={
                  <span style={{ color: 'red' }}>
                    <FormattedMessage
                      id="composer.max-n-tags"
                      values={{ n: 5 }}
                    />
                  </span>
                }
                tokenSeparators={[' ', ',']}
                onChange={this.tagsChanged}
                defaultValue={defaultValues.tags}
                value={tags}
                dropdownClassName="tag-select-options"
              >
                {tagOptions}
              </Select>
            </div>
          </Fragment>
        )}
        <div className="body-input">
          <CodeMirror
            mode="spell-checker"
            backdrop="markdown"
            onChange={this.bodyChanged}
            options={editorOptions}
            editorDidMount={editor => {
              this.editorInstance = editor;

              const { autoFocus2Body } = this.props;
              if (autoFocus2Body) {
                editor.focus();
              }
            }}
            onPaste={this.onPaste}
            onKeyDown={this.onKeyDown}
            onDragEnter={this.onDragEnter}
            onDragLeave={this.onDragLeave}
            onDragOver={this.onDragOver}
            onDrop={this.onDrop}
            onScroll={this.onScroll}
            value={defaultValues.body}
            onFocus={() => {
              this.setState({ activeInput: 'body' });
            }}
          />
        </div>

        <input
          className="file-input"
          id="file-input"
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
        />
        {activeAccount && (
          <GalleryModal
            {...this.props}
            visible={galleryModalVisible}
            onCancel={() => {
              this.setState({ galleryModalVisible: false });
            }}
            onSelect={imageUrl => {
              this.setState({ galleryModalVisible: false });

              const imageName = imageUrl.split('/').pop();
              const imgTag = `![${imageName}](${imageUrl})`;
              this.insertBlock(imgTag);
            }}
          />
        )}
      </div>
    );
  }
}

Editor.defaultProps = {
  activeAccount: null,
  syncWith: null,
  autoFocus2Body: false,
  mode: 'post',
  bodyPlaceHolder: ''
};

Editor.propTypes = {
  defaultValues: PropTypes.shape({
    title: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    body: PropTypes.string.isRequired
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  syncWith: PropTypes.string,
  trendingTags: PropTypes.shape({
    list: PropTypes.array.isRequired
  }).isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  mode: PropTypes.string,
  autoFocus2Body: PropTypes.bool,
  bodyPlaceHolder: PropTypes.string,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default injectIntl(Editor, { withRef: true });
