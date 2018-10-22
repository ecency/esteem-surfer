/*
eslint-disable react/no-multi-comp
*/

import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';

import { UnControlled as CodeMirror } from 'react-codemirror2';
import { Input, Select, message } from 'antd';

import NavBar from './layout/NavBar';
import AppFooter from './layout/AppFooter';

import { getItem, setItem } from '../helpers/storage';
import markDown2Html from '../utils/markdown-2-html';

import { uploadImage } from '../backend/esteem-client';

require('codemirror/addon/display/placeholder.js');
require('codemirror/addon/search/searchcursor.js');
require('codemirror/addon/search/match-highlighter.js');

require('codemirror/mode/markdown/markdown');

export class Editor extends Component {
  constructor(props) {
    super(props);

    const { defaultValues } = this.props;

    this.state = {
      title: defaultValues.title,
      tags: defaultValues.tags,
      body: defaultValues.body
    };

    this.editorInstance = null;

    this.ignoreEditorScroll = false;
    this.ignoreSyncElScroll = false;
  }

  componentDidMount() {
    this.syncTimer = setInterval(this.syncHeights, 1000);

    const { syncWith } = this.props;
    if (syncWith) {
      document
        .querySelector(syncWith)
        .addEventListener('scroll', this.onSyncElScroll);
    }
  }

  componentWillUnmount() {
    clearInterval(this.syncTimer);

    const { syncWith } = this.props;
    if (syncWith) {
      document
        .querySelector(syncWith)
        .removeEventListener('scroll', this.onSyncElScroll);
    }
  }

  changed = () => {
    const { onChange } = this.props;
    const { title, tags, body } = this.state;

    // console.log(body)

    onChange({ title, tags, body });
  };

  titleChanged = e => {
    this.setState({ title: e.target.value }, () => this.changed());
  };

  tagsChanged = e => {
    this.setState({ tags: e }, () => this.changed());
  };

  bodyChanged = (editor, data, value) => {
    this.setState({ body: value }, () => this.changed());
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

  header = () => {
    this.insertInline('# ');
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

    console.log('onDragEnter');
  };

  onDragLeave = (editor, event) => {
    event.stopPropagation();
    event.preventDefault();

    console.log('onDragLeave');
  };

  onDragOver = (editor, event) => {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy'; // eslint-disable-line no-param-reassign

    console.log('onDragOver');
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
  };

  onSyncElScroll = e => {
    if (this.ignoreEditorScroll) {
      this.ignoreEditorScroll = false;
      return;
    }

    this.ignoreSyncElScroll = true;
    this.editorInstance.scrollTo(0, e.target.scrollTop);
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
    const { defaultValues, trendingTags } = this.props;

    const tagOptions = trendingTags.list.map(tag => (
      <Select.Option key={tag}>{tag}</Select.Option>
    ));

    const toolbar = (
      <div className="editor-toolbar">
        <div className="editor-tool" onClick={this.bold} role="none">
          <i className="mi tool-icon">format_bold</i>
        </div>
        <div className="editor-tool" onClick={this.italic} role="none">
          <i className="mi tool-icon">format_italic</i>
        </div>
        <div className="editor-tool" onClick={this.header} role="none">
          <i className="mi tool-icon">title</i>
        </div>
        <div className="tool-separator" />
        <div className="editor-tool" onClick={this.code} role="none">
          <i className="mi tool-icon">code</i>
        </div>
        <div className="editor-tool" onClick={this.quote} role="none">
          <i className="mi tool-icon">format_quote</i>
        </div>
        <div className="tool-separator" />
        <div className="editor-tool" onClick={this.olList} role="none">
          <i className="mi tool-icon">format_list_numbered</i>
        </div>
        <div className="editor-tool" onClick={this.ulList} role="none">
          <i className="mi tool-icon">format_list_bulleted</i>
        </div>
        <div className="tool-separator" />
        <div className="editor-tool" onClick={this.link} role="none">
          <i className="mi tool-icon">link</i>
        </div>
        <div
          className="editor-tool"
          onClick={() => {
            this.image();
          }}
          role="none"
        >
          <i className="mi tool-icon">image</i>
        </div>
        <div className="editor-tool" onClick={this.table} role="none">
          <i className="mi tool-icon">grid_on</i>
        </div>
      </div>
    );

    const editorOptions = {
      mode: 'markdown',
      theme: 'day',
      lineWrapping: true,
      tabSize: 2,
      dragDrop: true,
      placeholder: 'Post Content',
      highlightSelectionMatches: { wordsOnly: true }
    };

    return (
      <div className="editor-form">
        {toolbar}
        <div className="title-input">
          <Input
            type="text"
            placeholder="Title"
            autoFocus
            onChange={this.titleChanged}
            defaultValue={defaultValues.title}
          />
        </div>
        <div className="tags-input">
          <Select
            mode="tags"
            placeholder="Tags. First tag is your main category"
            maxTagCount={5}
            maxTagPlaceholder={<span style={{ color: 'red' }}>Max 5 tags</span>}
            tokenSeparators={[' ', ',']}
            onChange={this.tagsChanged}
            defaultValue={defaultValues.tags}
            dropdownClassName="tag-select-options"
            dropdownMenuStyle={{ color: 'red' }}
          >
            {tagOptions}
          </Select>
        </div>
        <div className="body-input">
          <CodeMirror
            mode="spell-checker"
            backdrop="markdown"
            onChange={this.bodyChanged}
            options={editorOptions}
            editorDidMount={editor => {
              this.editorInstance = editor;
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
      </div>
    );
  }
}

Editor.propTypes = {
  defaultValues: PropTypes.shape({
    title: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    body: PropTypes.string.isRequired
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  syncWith: PropTypes.string.isRequired,
  trendingTags: PropTypes.shape({
    list: PropTypes.array.isRequired
  }).isRequired
};

class Compose extends Component {
  constructor(props) {
    super(props);

    const title = getItem('compose-title') || '';
    const tags = getItem('compose-tags') || [];
    const body = getItem('compose-body') || '';

    this.state = {
      title,
      tags,
      body,
      defaultValues: {
        title,
        tags,
        body
      }
    };
  }

  editorChanged = newValues => {
    setItem('compose-title', newValues.title);
    setItem('compose-tags', newValues.tags);
    setItem('compose-body', newValues.body);

    // const html = markDown2Html(newValues.body);

    this.setState({
      title: newValues.title,
      tags: newValues.tags,
      body: newValues.body
    });
  };

  render() {
    const loading = true;

    const { title, tags, body, defaultValues } = this.state;

    const renderedBody = { __html: markDown2Html(body) };

    return (
      <div className="wrapper">
        <NavBar
          {...this.props}
          reloadFn={() => {
            this.refresh();
          }}
          reloading={loading}
        />
        <div className="app-content compose-page">
          <Editor
            {...this.props}
            defaultValues={defaultValues}
            onChange={this.editorChanged}
            syncWith="#preview-content-body"
          />
          <div className="preview-part">
            <div className="preview-part-title">
              <h2>Preview</h2>
            </div>

            <div className="preview-content">
              <div className="preview-content-title">{title}</div>
              <div className="preview-content-tags">
                {tags.map(t => (
                  <div className="content-tag">{t}</div>
                ))}
              </div>
              <div className="preview-content-body" id="preview-content-body">
                <div
                  className="markdown-view"
                  dangerouslySetInnerHTML={renderedBody}
                />
              </div>
            </div>
          </div>
        </div>
        <AppFooter {...this.props} />
      </div>
    );
  }
}

export default injectIntl(Compose);
