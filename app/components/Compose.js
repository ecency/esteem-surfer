/*
eslint-disable react/no-multi-comp, no-underscore-dangle
*/

import React, {Component} from 'react';
import {FormattedMessage, injectIntl} from 'react-intl';
import PropTypes from 'prop-types';

import {UnControlled as CodeMirror} from 'react-codemirror2';
import {Input, Select, Tooltip, Checkbox, Button, Dropdown, Menu, message} from 'antd';

import NavBar from './layout/NavBar';
import AppFooter from './layout/AppFooter';
import GalleryModal from './Gallery';
import LoginRequired from './helpers/LoginRequired';

import {getItem, setItem, getVotingPercentage} from '../helpers/storage';
import markDown2Html from '../utils/markdown-2-html';

import {uploadImage, addMyImage, getDrafts, addDraft, updateDraft} from '../backend/esteem-client';
import {revokePostingPermission, grantPostingPermission, comment} from '../backend/steem-client';
import {createPermlink, makeOptions, makeJsonMetadata, extractMetadata} from "../utils/posting-helpers";

import {version} from '../../package.json';

require('codemirror/addon/display/placeholder.js');
require('codemirror/addon/search/searchcursor.js');
require('codemirror/addon/search/match-highlighter.js');
require('codemirror/mode/markdown/markdown');

export class Editor extends Component {
  constructor(props) {
    super(props);

    const {defaultValues} = this.props;

    this.state = {
      title: defaultValues.title,
      tags: defaultValues.tags,
      body: defaultValues.body,
      galleryModalVisible: false
    };

    this.editorInstance = null;

    this.ignoreEditorScroll = false;
    this.ignoreSyncElScroll = false;
  }

  componentDidMount() {
    this.syncTimer = setInterval(this.syncHeights, 1000);

    const {syncWith} = this.props;
    if (syncWith) {
      document
        .querySelector(syncWith)
        .addEventListener('scroll', this.onSyncElScroll);
    }


    document.getElementById('file-input').addEventListener('change', this.handleFileInput);
  }

  componentWillUnmount() {
    clearInterval(this.syncTimer);

    const {syncWith} = this.props;
    if (syncWith) {
      document
        .querySelector(syncWith)
        .removeEventListener('scroll', this.onSyncElScroll);
    }

    document.getElementById('file-input').removeEventListener('change', this.handleFileInput);
  }

  clear = () => {
    this.setState({
      title: '',
      tags: [],
      body: ''
    }, () => {
      this.changed()
    });

    // binding codemirror to state variable is troublesome. manually set code mirror value.
    this.editorInstance.setValue('');
  };

  changed = () => {
    const {onChange} = this.props;
    const {title, tags, body} = this.state;

    onChange({title, tags, body});
  };

  titleChanged = e => {
    this.setState({title: e.target.value}, () => this.changed());
  };

  tagsChanged = e => {
    const tags = [...e].map(x => x.trim().toLowerCase());
    this.setState({tags}, () => this.changed());
  };

  bodyChanged = (editor, data, value) => {
    this.setState({body: value}, () => this.changed());
  };

  getEditorInstance = () => this.editorInstance;

  insertInline = (before = '', after = '') => {
    const editor = this.getEditorInstance();
    const selection = editor.getSelection();

    editor.replaceSelection(`${before}${selection}${after}`);

    const {line, ch} = editor.getCursor();
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
    const searchCursor = editor.getSearchCursor(search, {line: 0, ch: 0});
    searchCursor.findNext();

    if (!searchCursor.atOccurrence) {
      return false;
    }

    const {from, to} = searchCursor.pos;
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

  handleFileInput = (event) => {
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
    const {syncWith} = this.props;
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

    const {url: imageUrl} = uploadResp;
    const imageName = imageUrl.split('/').pop();

    const imgTag = `![${imageName}](${imageUrl})`;

    this.replaceRange(tempImgTag, imgTag);

    const {activeAccount} = this.props;
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

  syncHeights = () => {
    const {syncWith} = this.props;
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
    const {defaultValues, trendingTags, activeAccount, intl} = this.props;
    const {galleryModalVisible, tags, title} = this.state;

    const tagOptions = trendingTags.list.map(tag => (
      <Select.Option key={tag}>{tag}</Select.Option>
    ));

    const toolbar = (
      <div className="editor-toolbar">
        <Tooltip
          title={intl.formatMessage({id: 'composer.tool-bold'})}
          mouseEnterDelay={2}
        >
          <div className="editor-tool" onClick={this.bold} role="none">
            <i className="mi tool-icon">format_bold</i>
          </div>
        </Tooltip>
        <Tooltip
          title={intl.formatMessage({id: 'composer.tool-italic'})}
          mouseEnterDelay={2}
        >
          <div className="editor-tool" onClick={this.italic} role="none">
            <i className="mi tool-icon">format_italic</i>
          </div>
        </Tooltip>
        <Tooltip
          title={intl.formatMessage({id: 'composer.tool-header'})}
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
        <div className="tool-separator"/>
        <Tooltip
          title={intl.formatMessage({id: 'composer.tool-code'})}
          mouseEnterDelay={2}
        >
          <div className="editor-tool" onClick={this.code} role="none">
            <i className="mi tool-icon">code</i>
          </div>
        </Tooltip>
        <Tooltip
          title={intl.formatMessage({id: 'composer.tool-quote'})}
          mouseEnterDelay={2}
        >
          <div className="editor-tool" onClick={this.quote} role="none">
            <i className="mi tool-icon">format_quote</i>
          </div>
        </Tooltip>
        <div className="tool-separator"/>
        <Tooltip
          title={intl.formatMessage({id: 'composer.tool-ol'})}
          mouseEnterDelay={2}
        >
          <div className="editor-tool" onClick={this.olList} role="none">
            <i className="mi tool-icon">format_list_numbered</i>
          </div>
        </Tooltip>
        <Tooltip
          title={intl.formatMessage({id: 'composer.tool-ul'})}
          mouseEnterDelay={2}
        >
          <div className="editor-tool" onClick={this.ulList} role="none">
            <i className="mi tool-icon">format_list_bulleted</i>
          </div>
        </Tooltip>
        <div className="tool-separator"/>
        <Tooltip
          title={intl.formatMessage({id: 'composer.tool-link'})}
          mouseEnterDelay={2}
        >
          <div className="editor-tool" onClick={this.link} role="none">
            <i className="mi tool-icon">link</i>
          </div>
        </Tooltip>
        <Tooltip
          title={intl.formatMessage({id: 'composer.tool-image'})}
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
              <div className="sub-tool-menu-item" role="none" onClick={(event) => {
                event.stopPropagation();
                document.getElementById('file-input').click();
              }}>
                <FormattedMessage id="composer.tool-upload"/>
              </div>
              {activeAccount && (
                <div
                  className="sub-tool-menu-item"
                  role="none"
                  onClick={event => {
                    event.stopPropagation();
                    this.setState({galleryModalVisible: true});
                  }}
                >
                  <FormattedMessage id="composer.tool-gallery"/>
                </div>
              )}
            </div>
          </div>
        </Tooltip>
        <Tooltip
          title={intl.formatMessage({id: 'composer.tool-table'})}
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
      placeholder: intl.formatMessage({id: 'composer.body-placeholder'}),
      highlightSelectionMatches: {wordsOnly: true}
    };

    return (
      <div className="editor-form">
        {toolbar}
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
              <span style={{color: 'red'}}>
                <FormattedMessage id="composer.max-n-tags" values={{n: 5}}/>
              </span>
            }
            tokenSeparators={[' ', ',']}
            onChange={this.tagsChanged}
            defaultValue={defaultValues.tags}
            value={tags}
            dropdownClassName="tag-select-options"
            dropdownMenuStyle={{color: 'red'}}
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

        <input className="file-input" id="file-input" type="file" accept="image/*" multiple style={{display: 'none'}}/>
        {activeAccount &&
        <GalleryModal
          {...this.props}
          visible={galleryModalVisible}
          onCancel={() => {
            this.setState({galleryModalVisible: false});
          }}
          onSelect={imageUrl => {
            this.setState({galleryModalVisible: false});

            const imageName = imageUrl.split('/').pop();
            const imgTag = `![${imageName}](${imageUrl})`;
            this.insertBlock(imgTag);
          }}
        />}
      </div>
    );
  }
}

Editor.defaultProps = {
  activeAccount: null
};

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
  }).isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  intl: PropTypes.instanceOf(Object).isRequired
};

export class Preview extends Component {
  render() {
    const {title, tags, body} = this.props;
    return (
      <div className="preview-part">
        <div className="preview-part-title">
          <h2>
            <FormattedMessage id="composer.preview"/>
          </h2>
        </div>

        <div className="preview-content">
          <div className="preview-content-title">{title}</div>
          <div className="preview-content-tags">
            {tags.map(t => (
              <div key={t} className="content-tag">
                {t}
              </div>
            ))}
          </div>
          <div className="preview-content-body" id="preview-content-body">
            <div className="markdown-view" dangerouslySetInnerHTML={body}/>
          </div>
        </div>
      </div>
    );
  }
}

Preview.defaultProps = {
  title: '',
  tags: [],
  body: {}
};

Preview.propTypes = {
  title: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  body: PropTypes.instanceOf(Object)
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
      },
      draftId: null,
      reward: 'default',
      upvote: true,
      posting: false,
      permProcessing: false
    };

    this.editor = React.createRef();
  }

  async componentDidMount() {
    // this.detectPostingPerm();

    this.detectDraft();
  }

  detectDraft = async () => {
    const {match, activeAccount} = this.props;
    const {path, params} = match;
    if (activeAccount && path.startsWith('/draft') && params.id) {
      let drafts;

      try {
        drafts = await getDrafts(activeAccount.username);
      } catch (err) {
        drafts = [];
      }

      drafts = drafts.filter(x => x._id === params.id);
      if (drafts.length === 1) {
        const draft = drafts[0];
        const {title, body} = draft;
        let {tags} = draft;

        try {
          tags = tags.split(' ');
        } catch (e) {
          tags = []
        }

        this.editor.current.setState({title, body, tags});
        this.editor.current.editorInstance.setValue(body);
        this.editor.current.changed();

        this.setState({draftId: params.id});
      }
    }
  };

  clear = () => {
    this.editor.current.clear();

    const {draftId} = this.state;

    if (draftId) {
      const {history} = this.props;
      setTimeout(() => {
        const newLoc = `/new`;
        history.push(newLoc);
      }, 200);
    }
  };

  removePostingPerm = () => {
    this.setState({permProcessing: true});
    const {activeAccount, global, actions} = this.props;
    revokePostingPermission(activeAccount, global.pin).then((resp) => {
      actions.updateActiveAccount();
      return resp;
    }).catch(() => {

    }).finally(() => {
      this.setState({permProcessing: false});
    });
  };

  grantPostingPerm = () => {
    const {activeAccount, global, actions} = this.props;
    grantPostingPermission(activeAccount, global.pin).then(resp => {
      console.log(resp)
    })
  };


  editorChanged = newValues => {
    setItem('compose-title', newValues.title);
    setItem('compose-tags', newValues.tags);
    setItem('compose-body', newValues.body);

    this.setState({
      title: newValues.title,
      tags: newValues.tags,
      body: newValues.body
    });
  };

  saveDraft = () => {
    const {activeAccount, intl} = this.props;

    const {draftId} = this.state;
    const {title, body} = this.state;
    let {tags} = this.state;

    tags = tags.join(' ');

    let prms;

    if (draftId) {
      prms = updateDraft(activeAccount.username, draftId, title, body, tags);
    } else {
      prms = addDraft(activeAccount.username, title, body, tags).then(resp => {
        const {drafts} = resp;
        const draft = drafts.pop();

        setTimeout(() => {
          const {history} = this.props;
          const newLoc = `/draft/${draft._id}`;
          history.push(newLoc);
        }, 300)
      })
    }

    prms.then(() => {
      message.success(intl.formatMessage({id: 'composer.draft-saved'}));
    }).catch(() => {
      message.error(intl.formatMessage({id: 'composer.draft-save-error'}));
    })
  };

  publish = () => {
    const {activeAccount, global} = this.props;
    const {title, tags, body, reward, upvote} = this.state;

    this.setState({posting: true});

    const parentPermlink = tags[0];
    const permlink = createPermlink(title);
    const meta = extractMetadata(body);
    const jsonMeta = makeJsonMetadata(meta, tags, version);
    const options = makeOptions(activeAccount.username, permlink, reward);
    const voteWeight = upvote ? (getVotingPercentage(activeAccount.username) * 100) : null;

    comment(activeAccount, global.pin, '', parentPermlink, permlink, title, body, jsonMeta, options, voteWeight).then(resp => {
      console.log(resp);
    }).catch((err) => {

    }).finally(() => {
      this.setState({posting: false});
    })
  };

  render() {
    const loading = true;

    const {title, tags, body, defaultValues, reward, upvote, posting, permProcessing} = this.state;

    const renderedBody = {__html: markDown2Html(body)};

    let hasPerm = false;

    const {activeAccount} = this.props;
    if (activeAccount && activeAccount.accountData) {
      hasPerm = activeAccount.accountData.posting.account_auths.filter(x => x[0] === 'esteemapp').length > 0;
    }

    const canPublish = title.trim() !== '' && tags.length > 0 && tags.length <= 5 && body.trim() !== '';

    let menu;
    if (hasPerm) {
      menu = (
        <Menu onClick={(item) => {
          switch (item.key) {
            case 'removePerm':
              this.removePostingPerm();
              break;
          }
        }}>
          <Menu.Item key="selectDate">Select Date</Menu.Item>
          <Menu.Item key="removePerm">Remove Posting Permission</Menu.Item>
        </Menu>
      );
    } else {
      menu = (<Menu onClick={() => {
        this.grantPostingPerm();
      }}>
        <Menu.Item key="grantPerm">Grant Posting Permission</Menu.Item>
      </Menu>)
    }

    return (
      <div className="wrapper">
        <NavBar {...this.props} reloadFn={() => {
        }} reloading={loading}/>
        <div className="app-content compose-page">
          <Editor
            {...this.props}
            defaultValues={defaultValues}
            onChange={this.editorChanged}
            syncWith="#preview-content-body"
            ref={this.editor}
          />
          <Preview
            {...this.props}
            title={title}
            tags={tags}
            body={renderedBody}
          />
          <div className="clearfix"/>
          <div className="control-part">
            <div className="left-controls">
              <div className="reward">
              <span className="reward-label">
                Reward
              </span>
                <Select style={{width: '180px'}} value={reward} onChange={(val) => {
                  this.setState({reward: val});
                }}>
                  <Select.Option key="default">Default 50% / 50%</Select.Option>
                  <Select.Option key="sp">Power Up 100%</Select.Option>
                  <Select.Option key="dp">Decline Payout</Select.Option>
                </Select>
              </div>
              <div className="voting">
                <Checkbox checked={upvote} onChange={(e) => {
                  this.setState({
                    upvote: e.target.checked,
                  });
                }}>Upvote</Checkbox>
              </div>
              <div className="clear">
                <Button className="clean-button" onClick={this.clear}>Clear All</Button>
              </div>
            </div>
            <div className="right-controls">
              <div className="schedule">
                <Dropdown overlay={menu} trigger={['click']} disabled={permProcessing}>
                  <Button className="clean-button">
                    <i className="mi" style={{marginRight: '5px'}}>timer</i> Schedule
                  </Button>
                </Dropdown>
              </div>
              <div className="draft">
                <LoginRequired {...this.props}>
                  <Button className="clean-button" disabled={!canPublish} onClick={this.saveDraft}>
                    <i className="mi" style={{marginRight: '5px'}}>save</i> Save Draft
                  </Button>
                </LoginRequired>
              </div>
              <div className="publish">
                <LoginRequired {...this.props} requiredKeys={['posting']}>
                  <Button type="primary" disabled={!canPublish} onClick={this.publish} loading={posting}>
                    Publish
                  </Button>
                </LoginRequired>
              </div>
            </div>
          </div>
        </div>
        <AppFooter {...this.props} />
      </div>
    );
  }
}

Compose.defaultProps = {
  activeAccount: null
};

Compose.propTypes = {
  activeAccount: PropTypes.instanceOf(Object),
  intl: PropTypes.instanceOf(Object).isRequired,
  global: PropTypes.shape({
    pin: PropTypes.string
  }).isRequired,
  actions: PropTypes.shape({
    updateActiveAccount: PropTypes.func.isRequired
  }).isRequired,
  match: PropTypes.instanceOf(Object).isRequired,
  history: PropTypes.instanceOf(Object).isRequired
};

export default injectIntl(Compose);
