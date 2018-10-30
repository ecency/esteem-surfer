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

    if (entry) {
      reputation = authorReputation(entry.author_reputation);
      created = parseDate(entry.created);

      renderedBody = {__html: markDown2Html(entry.body)};
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
        />
        <div className="app-content entry-page">
          {entry &&
          <div className="the-entry">
            <div className="entry-header">
              <h1 className="entry-title">{entry.title}</h1>
              <div className="entry-info">
                <div className="author-avatar">
                  <UserAvatar user={entry.author} size="medium"/>
                </div>

                <div className="author">
                  {entry.author}{' '}
                  <span className="author-reputation">{reputation}</span>
                </div>
                <a
                  className="category"
                  role="none"
                  onClick={() => this.parentClicked(entry.parent_permlink)}
                >
                  {entry.category}
                </a>
                <span className="date">
                  <FormattedRelative value={created} initialNow={Date.now()}/>
                </span>
              </div>
            </div>
            <div className="entry-body markdown-view" dangerouslySetInnerHTML={renderedBody}/>

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
