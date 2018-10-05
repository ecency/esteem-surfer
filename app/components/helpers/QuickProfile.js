import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Drawer, Button, Tooltip} from 'antd';
import {FormattedNumber} from 'react-intl';

import {getAccounts, getDiscussions, getFollowCount} from "../../backend/steem-client";
import proxifyImageSrc from '../../utils/proxify-image-src';
import authorReputation from '../../utils/author-reputation';


import UserAvatar from "../elements/UserAvatar";
// import EntryListItem from '../elements/EntryListItem'
import EntryListLoadingItem from '../elements/EntryListLoadingItem';



class QuickProfile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      active: false,
      loading: true,
      entries: [],


      profile: {
        name: null,
        username: null,
        about: null,
        coverImage: null,
        reputation: null,
        followerCount: null,
        followingCount: null,
        postCount: null
      }
    };
  }

  load = async () => {
    const {author} = this.props;

    const accounts = await getAccounts([author]);
    const follow = await getFollowCount(author);


    const account = accounts[0];

    let accountProfile = {};
    try {
      accountProfile = JSON.parse(account.json_metadata).profile;
    } catch (err) {

    }

    const name = accountProfile.name || null;
    const username = account.name;
    const about = accountProfile.about || null;
    const coverImage = accountProfile.cover_image ? proxifyImageSrc(accountProfile.cover_image) : null;
    const reputation = authorReputation(account.reputation);
    const followerCount = follow.follower_count;
    const followingCount = follow.following_count;
    const postCount = account.post_count;

    const profile = {name, username, about, coverImage, reputation, followerCount, followingCount, postCount};

    this.setState({profile});


    const entries = await getDiscussions('blog', {
      tag: author,
      limit: 7,
      start_author: undefined,
      start_permlink: undefined
    });

    this.setState({entries, loading: false});
  };


  show = () => {
    this.setState({active: true, visible: true});
    this.load()
  };

  hide = () => {
    this.setState({visible: false});
    setTimeout(() => {
      this.setState({active: false});
    }, 500)
  };

  render() {
    const {children, author} = this.props;

    const {visible, active, loading, profile, entries} = this.state;


    const newChild = React.cloneElement(children, {
      onClick: () => {
        this.show();
      }
    });


    return (
      <Fragment>
        {newChild}

        {active &&
        <Drawer
          placement="right"
          closable={false}
          onClose={this.hide}
          visible={visible}
          width="640px">
          <div className={`quick-profile-content ${loading ? 'loading' : ''}`}>

            {loading &&
            <Fragment>
              <div className="author-profile">
                <div className="follow-author"/>
                <div className="author-avatar"/>
                <div className="full-name"/>
                <div className="username"/>
                <div className="about"/>
                <div className="numbers"/>
              </div>
              <div className="entries">
                <EntryListLoadingItem/>
              </div>
            </Fragment>
            }


            {!loading &&
            <Fragment>
              <div className="author-profile">
                <div className="follow-author">
                  <Tooltip placement="left" title={`Follow @${author}`}>

                    <Button type="primary" shape="circle" size="large"><i className="mi">person_add</i></Button>
                  </Tooltip>
                </div>
                <div className="author-avatar">
                  <UserAvatar user={author} size="large"/>
                  <div className="reputation">{profile.reputation}</div>
                </div>

                {profile.name &&
                <div className="full-name">{profile.name}</div>
                }

                <div className="username">{profile.username}</div>
                {profile.about &&
                <div className="about">{profile.about}</div>
                }
                <div className="numbers">
                  <span className="followers"> <FormattedNumber value={profile.followerCount}/> followers</span>
                  <span className="post-count"> <FormattedNumber value={profile.postCount}/> posts</span>
                  <span className="following"> <FormattedNumber value={profile.followingCount}/> following</span>
                </div>
              </div>

              <div className="entries">

              </div>
            </Fragment>
            }
          </div>
        </Drawer>
        }

      </Fragment>
    );
  }
}

QuickProfile.defaultProps = {};

QuickProfile.propTypes = {
  children: PropTypes.element.isRequired,
  author: PropTypes.string.isRequired
};

export default QuickProfile;
