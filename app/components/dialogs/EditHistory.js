/*
eslint-disable camelcase, prefer-destructuring, no-param-reassign, new-cap, react/no-multi-comp
*/

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedMessage } from 'react-intl';

import { Modal, Checkbox } from 'antd';

import { diff_match_patch } from 'diff-match-patch';

import { renderPostBody } from '@esteemapp/esteem-render-helpers';

import LinearProgress from '../common/LinearProgress';

import { getCommentHistory } from '../../backend/esteem-client';

const dmp = new diff_match_patch();

const make_diff = (str1, str2) => {
  const d = dmp.diff_main(str1, str2);
  dmp.diff_cleanupSemantic(d);
  return dmp.diff_prettyHtml(d).replace(/&para;/g, '&nbsp;');
};

class EditHistory extends Component {
  constructor(props) {
    super(props);

    this.state = {
      history: [],
      selected: 1,
      showDiff: false,
      loading: true
    };
  }

  componentDidMount() {
    this.loadData();
  }

  buildList = raw => {
    const t = [];

    let h = '';
    for (let l = 0; l < raw.length; l += 1) {
      if (raw[l].body.startsWith('@@')) {
        const p = dmp.patch_fromText(raw[l].body);
        h = dmp.patch_apply(p, h)[0];
        raw[l].body = h;
      } else {
        h = raw[l].body;
      }

      t.push({
        v: raw[l].v,
        title: raw[l].title,
        body: h,
        timestamp: raw[l].timestamp,
        tags: raw[l].tags.join(', ')
      });
    }

    for (let l = 0; l < t.length; l += 1) {
      const p = l > 0 ? l - 1 : l;

      t[l].title_diff = make_diff(t[p].title, t[l].title);
      t[l].body_diff = make_diff(t[p].body, t[l].body);
      t[l].tags_diff = make_diff(t[p].tags, t[l].tags);
    }

    return t;
  };

  loadData = () => {
    const { entry } = this.props;

    return getCommentHistory(entry.author, entry.permlink)
      .then(resp => {
        this.setState({ history: this.buildList(resp.list), loading: false });
        return resp;
      })
      .then(r => {
        setTimeout(() => {
          const el = document.getElementById('edit-history-body');
          if (el) el.addEventListener('click', this.bodyClicked);
        }, 400);

        return r;
      });
  };

  bodyClicked = e => {
    e.stopImmediatePropagation();
  };

  itemClicked = i => {
    this.setState({ selected: i.v });
  };

  diffChanged = e => {
    this.setState({ showDiff: e.target.checked });
  };

  render() {
    const { history, selected, loading, showDiff } = this.state;
    const selectedItem = history.find(x => x.v === selected);

    let title = '';
    let body = '';
    let tags = '';

    if (selectedItem) {
      title = {
        __html: showDiff ? selectedItem.title_diff : selectedItem.title
      };
      body = {
        __html: showDiff
          ? selectedItem.body_diff
          : renderPostBody(selectedItem.body)
      };
      tags = { __html: showDiff ? selectedItem.tags_diff : selectedItem.tags };
    }

    return (
      <div className="edit-history-dialog-content">
        {loading && <LinearProgress />}

        {!loading && (
          <Fragment>
            <div className="version-list">
              <div className="diff-select">
                <Checkbox value={showDiff} onChange={this.diffChanged}>
                  <FormattedMessage id="edit-history.show-diff" />
                </Checkbox>
              </div>

              {history.map(i => (
                <div
                  role="none"
                  key={i.v}
                  className={`version-list-item ${
                    selected === i.v ? 'selected' : ''
                  }`}
                  onClick={() => {
                    this.itemClicked(i);
                  }}
                >
                  <div className="item-icon">
                    <i className="mi">history</i>
                  </div>
                  <div className="item-title">
                    <FormattedMessage
                      id="edit-history.version"
                      values={{ n: i.v }}
                    />
                  </div>
                  <div className="item-date">
                    <FormattedDate
                      updateInterval={0}
                      value={i.timestamp}
                      initialNow={Date.now()}
                      month="long"
                      day="2-digit"
                      year="numeric"
                      hour="numeric"
                      minute="numeric"
                    />
                  </div>
                </div>
              ))}
            </div>

            {selectedItem && (
              <div className="version-detail">
                <h1 className="entry-title" dangerouslySetInnerHTML={title} />
                <div className="entry-tags">
                  <i className="mi">local_offer</i>{' '}
                  <span dangerouslySetInnerHTML={tags} />
                </div>
                <div
                  id="edit-history-body"
                  className="entry-body markdown-view user-selectable"
                  dangerouslySetInnerHTML={body}
                />
              </div>
            )}
          </Fragment>
        )}
      </div>
    );
  }
}

EditHistory.defaultProps = {};

EditHistory.propTypes = {
  entry: PropTypes.instanceOf(Object).isRequired
};

class EditHistoryModal extends Component {
  render() {
    const { visible, onCancel, intl } = this.props;

    return (
      <Modal
        visible={visible}
        footer={false}
        width="890px"
        onCancel={onCancel}
        destroyOnClose
        centered
        title={intl.formatMessage({ id: 'edit-history.title' })}
      >
        <EditHistory {...this.props} />
      </Modal>
    );
  }
}

EditHistoryModal.defaultProps = {};

EditHistoryModal.propTypes = {
  entry: PropTypes.instanceOf(Object).isRequired,
  onCancel: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default EditHistoryModal;
