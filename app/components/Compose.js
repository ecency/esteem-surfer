/*
eslint-disable react/no-multi-comp
*/

import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';

import CodeMirror from 'react-codemirror';
import { Input, Select } from 'antd';

import NavBar from './layout/NavBar';
import AppFooter from './layout/AppFooter';

import { getItem, setItem } from '../helpers/storage';

require('codemirror/addon/display/placeholder.js');
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

    this.editorRef = React.createRef();
  }

  changed = () => {
    const { onChange } = this.props;
    const { title, tags, body } = this.state;

    onChange({ title, tags, body });
  };

  titleChanged = e => {
    this.setState({ title: e.target.value }, () => this.changed());
  };

  tagsChanged = e => {
    this.setState({ tags: e }, () => this.changed());
  };

  bodyChanged = newValue => {
    this.setState({ body: newValue }, () => this.changed());
  };

  getEditorInstance = () => this.editorRef.current.getCodeMirror();

  insert = (before, after = '', newLine = false) => {
    const editor = this.getEditorInstance();
    let bef = before;

    // add new line if document not empty
    if (newLine && editor.getValue()) {
      bef = `\n${bef}`;
    }

    const selection = editor.getSelection();
    editor.replaceSelection(`${bef}${selection}${after}`);

    // move cursor between newly added string
    if (after) {
      const { line, ch } = editor.getCursor();
      const newCh = ch - after.length;

      editor.setCursor(line, newCh);
    }

    editor.focus();
  };

  bold = () => {
    this.insert('**', '**');
  };

  italic = () => {
    this.insert('*', '*');
  };

  header = () => {
    this.insert('#');
  };

  code = () => {
    this.insert('<code>', '</code>');
  };

  quote = () => {
    this.insert('>');
  };

  olList = () => {
    this.insert('1. item1\n2. item2\n3. item3');
  };

  ulList = () => {
    this.insert('* item1\n* item2\n* item3');
  };

  table = () => {
    const t =
      '' +
      '|\tColumn 1\t|\tColumn 2\t|\tColumn 3\t|\n' +
      '|\t--------\t|\t--------\t|\t--------\t|\n' +
      '|\t  Text  \t|\t  Text  \t|\t  Text  \t|\n';
    this.insert(t, '', true);
  };

  link = () => {
    this.insert('[', '](url)');
  };

  image = (name = '', url = 'url') => {
    this.insert(`![${name}`, `](${url})`, true);
  };

  render() {
    const { defaultValues, onScroll } = this.props;

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
      placeholder: 'Post Content'
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
            maxTagPlaceholder="Max 5 tags"
            tokenSeparators={[' ', ',']}
            dropdownStyle={{ display: 'none' }}
            onChange={this.tagsChanged}
            defaultValue={defaultValues.tags}
          />
        </div>
        <div className="body-input">
          <CodeMirror
            ref={this.editorRef}
            onChange={this.bodyChanged}
            defaultValue={defaultValues.body}
            mode="markdown"
            onScroll={onScroll}
            options={editorOptions}
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
  onScroll: PropTypes.func.isRequired
};

class Compose extends Component {
  constructor(props) {
    super(props);

    const title = getItem('compose-title') || '';
    const tags = getItem('compose-tags') || [];
    const body = getItem('compose-body') || '';

    this.state = {
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
  };

  editorScrolled = () => {};

  render() {
    const loading = true;

    const { defaultValues } = this.state;

    return (
      <div className="wrapper">
        <NavBar
          {...this.props}
          reloadFn={() => {
            this.refresh();
          }}
          reloading={loading}
          favoriteFn={() => {}}
        />
        <div className="app-content compose-page">
          <Editor
            defaultValues={defaultValues}
            onChange={this.editorChanged}
            onScroll={this.editorScrolled}
          />
          <div className="preview-part" />
        </div>
        <AppFooter {...this.props} />
      </div>
    );
  }
}

export default injectIntl(Compose);
