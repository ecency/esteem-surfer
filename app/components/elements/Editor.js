/*
eslint-disable react/no-multi-comp, no-underscore-dangle
*/

import React, { Component, Fragment } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';

import { UnControlled as CodeMirror } from 'react-codemirror2';
import { Input, Select, Tooltip, message } from 'antd';

import GalleryModal from '../Gallery';

import { uploadImage, addMyImage } from '../../backend/esteem-client';

import markDown2Html from '../../utils/markdown-2-html';

require('codemirror/addon/display/placeholder.js');
require('codemirror/addon/search/searchcursor.js');
require('codemirror/addon/search/match-highlighter.js');
require('codemirror/mode/markdown/markdown');

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
    // this.syncTimer = setInterval(this.syncHeights, 1000);
    // this.widgetTimer = setInterval(this.setWidgets, 2000);

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
    // clearInterval(this.syncTimer);
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
    this.setState({ body: value }, () => this.changed());

    const { syncWith } = this.props;
    if (syncWith) {
      if (this.widgetTimer) {
        clearTimeout(this.widgetTimer);
      }

      this.widgetTimer = setTimeout(this.setWidgets, 500);
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

  table = () => {
    const t =
      '' +
      '|\tColumn 1\t|\tColumn 2\t|\tColumn 3\t|\n' +
      '|\t--------\t|\t--------\t|\t--------\t|\n' +
      '|\t  Text  \t|\t  Text  \t|\t  Text  \t|';
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
      .map(
        item => (item.type.indexOf('image') !== -1 ? item.getAsFile() : null)
      )
      .filter(i => i);

    if (files.length > 0) {
      event.stopPropagation();
      event.preventDefault();
    }

    files.forEach(file => this.upload(file));
  };

  onScroll = (editor, data) => {
    const { syncWith } = this.props;
    if (!syncWith) {
      return;
    }

    if (this.ignoreSyncElScroll) {
      this.ignoreSyncElScroll = false;
      return;
    }

    this.ignoreEditorScroll = true;

    document.querySelector(syncWith).scrollTop = data.top;
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

  onSyncElScroll = e => {
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

      const lineHtml = markDown2Html(lineVal);

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
      highlightSelectionMatches: { wordsOnly: true }
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
