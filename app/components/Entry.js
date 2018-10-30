/*
eslint-disable react/no-multi-comp
*/

import React, {Component} from 'react';
import PropTypes from "prop-types";
import {FormattedRelative, injectIntl} from "react-intl";

import NavBar from "./layout/NavBar";
import AppFooter from "./layout/AppFooter";
import {getAccount, getState} from "../backend/steem-client";
import UserAvatar from "./elements/UserAvatar";
import authorReputation from "../utils/author-reputation";
import parseDate from "../utils/parse-date";

import markDown2Html from '../utils/markdown-2-html';
import QuickProfile from "./helpers/QuickProfile";
import appName from "../utils/app-name";
import EntryTag from './elements/EntryTag';

class Entry extends Component {
  constructor(props) {
    super(props);

    const {visitingEntry} = this.props;

    this.state = {
      entry: (visitingEntry ? visitingEntry : null),
      comments: [],
      commentsLoading: true,
    };
  }

  componentDidMount() {
    const {match} = this.props;

    window.addEventListener('md-author-clicked', this.mdAuthorClicked);
    window.addEventListener('md-post-clicked', this.mdEntryClicked);
    window.addEventListener('md-tag-clicked', this.mdTagClicked);
  }

  componentWillUnmount() {
    window.removeEventListener('md-author-clicked', this.mdAuthorClicked);
    window.removeEventListener('md-post-clicked', this.mdEntryClicked);
    window.removeEventListener('md-tag-clicked', this.mdTagClicked);
  }

  mdAuthorClicked = (e) => {
    console.log(e.detail.author);
  };

  mdEntryClicked = (e) => {
    console.log(e.detail.category, e.detail.author, e.detail.permlink);
  };

  mdTagClicked = (e) => {
    console.log(e.detail.tag);
  };


  refresh = () => {

  };


  render() {


    const {entry} = this.state;

    let reputation;
    let created;
    let renderedBody;
    let tags = [];
    let app;

    if (entry) {
      reputation = authorReputation(entry.author_reputation);
      created = parseDate(entry.created);

      renderedBody = {__html: markDown2Html(entry.body)};

      let jsonMeta;
      try {
        jsonMeta = JSON.parse(entry.json_metadata);
      } catch (e) {
        jsonMeta = {};
      }

      // Sometimes tag list comes with duplicate items. Needs to singularize
      tags = [...new Set(jsonMeta.tags)];


      app = appName(jsonMeta.app);
    }


    const loading = false;

    return (
      <div className="wrapper">

        <NavBar
          {...this.props}
          reloadFn={() => {
            this.refresh();
          }}
          reloading={loading}
          bookmarkFn={() => {
          }}
          postBtnActive
        />
        <div className="app-content entry-page">
          {entry &&
          <div className="the-entry">
            <div className="entry-header">
              <h1 className="entry-title">{entry.title}</h1>
              <div className="entry-info">
                <QuickProfile
                  {...this.props}
                  username={entry.author}
                  reputation={entry.author_reputation}
                >
                  <div className="author-part">
                    <div className="author-avatar">
                      <UserAvatar user={entry.author} size="medium"/>
                    </div>
                    <div className="author">
                      <span className="author-name">{entry.author}</span>
                      <span className="author-reputation">{reputation}</span>
                    </div>
                  </div>
                </QuickProfile>
                <EntryTag {...this.props} tag={entry.category}>
                  <a
                    className="category"
                    role="none"
                  >{entry.category}</a>
                </EntryTag>
                <span className="separator"/>
                <span className="date">
                  <FormattedRelative value={created} initialNow={Date.now()}/>
                </span>
              </div>
            </div>
            <div className="entry-body markdown-view" dangerouslySetInnerHTML={renderedBody}/>
            <div className="entry-footer">
              <div className="entry-tags">
                {tags.map(t => (
                  <EntryTag {...this.props} tag={t}>
                    <div key={t} className="entry-tag">
                      {t}
                    </div>
                  </EntryTag>
                ))}
              </div>
              <div className="entry-info">
                <div className="left-side">
                  <div className="date">
                    <i className="mi">access_time</i>
                    <FormattedRelative value={created} initialNow={Date.now()}/>
                  </div>

                  <span className="separator"/>

                  <QuickProfile
                    {...this.props}
                    username={entry.author}
                    reputation={entry.author_reputation}
                  >
                    <div className="author">
                      <span className="author-prefix">by</span>
                      <span className="author-name">{entry.author}</span>
                      <span className="author-reputation">{reputation}</span>
                    </div>
                  </QuickProfile>

                  <span className="separator"/>

                  <div className="app">
                    via <span className="app-name">{app}</span>
                  </div>
                </div>
                <div className="right-side">
                  <div className="reply-btn">Reply</div>
                  <div className="comments-count"><i className="mi">comment</i>{entry.children}</div>
                </div>
              </div>
            </div>
          </div>
          }
        </div>
        <AppFooter {...this.props} />
      </div>
    )
  }
}


Entry.defaultProps = {
  activeAccount: null,
  visitingEntry: null
};

Entry.propTypes = {
  match: PropTypes.instanceOf(Object).isRequired,
  activeAccount: PropTypes.instanceOf(Object),
  visitingEntry: PropTypes.instanceOf(Object),
};

export default injectIntl(Entry);
