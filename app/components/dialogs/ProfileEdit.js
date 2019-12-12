/*
eslint-disable react/no-multi-comp
*/

import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Modal, Input, Button, Icon, message } from 'antd';
import { FormattedMessage } from 'react-intl';

import PinRequired from '../helpers/PinRequired';

import { updateProfile } from '../../backend/steem-client';
import { uploadImage } from '../../backend/esteem-client';

import formatChainError from '../../utils/format-chain-error';

class UploadIcon extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      inProgress: false
    };
  }

  fileInput = React.createRef();

  upload = () => {
    const el = this.fileInput.current;
    el.click();
  };

  handleFileInput = async event => {
    const files = [...event.target.files];

    if (files.length === 0) {
      return;
    }

    const file = files[0];

    const { onBegin, onEnd } = this.props;

    onBegin();

    this.setState({ inProgress: true });
    const resp = await uploadImage(file).then(r => r.data);
    this.setState({ inProgress: false });

    onEnd(resp.url);
  };

  render() {
    const { inProgress } = this.state;

    const uploadButtonIcon = inProgress ? (
      <Icon type="loading" style={{ fontSize: 14 }} spin />
    ) : (
      <Icon type="upload" style={{ fontSize: 22 }} />
    );

    return (
      <Fragment>
        <Button
          type="primary"
          className="button-control"
          disabled={inProgress}
          onClick={() => {
            this.upload();
          }}
        >
          {uploadButtonIcon}
        </Button>
        <input
          type="file"
          ref={this.fileInput}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={this.handleFileInput}
        />
      </Fragment>
    );
  }
}

UploadIcon.propTypes = {
  onBegin: PropTypes.func.isRequired,
  onEnd: PropTypes.func.isRequired
};

class ProfileEdit extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      about: '',
      location: '',
      website: '',
      coverImage: '',
      profileImage: '',
      inProgress: false
    };
  }

  componentDidMount() {
    const { account } = this.props;

    const { accountProfile } = account;
    if (accountProfile) {
      const coverImage = accountProfile.cover_image || '';
      const profileImage = accountProfile.profile_image || '';
      const name = accountProfile.name || '';
      const about = accountProfile.about || '';
      const location = accountProfile.location || '';
      const website = accountProfile.website || '';

      this.setState({
        name,
        about,
        location,
        website,
        coverImage,
        profileImage
      });
    }
  }

  valueChanged = e => {
    const id = e.target.getAttribute('data-var');
    const { value } = e.target;

    this.setState({ [id]: value });
  };

  save = pin => {
    const { account, activeAccount, intl } = this.props;
    const {
      name,
      about,
      location,
      website,
      coverImage,
      profileImage
    } = this.state;

    let curJsonMeta;
    try {
      curJsonMeta = JSON.parse(account.json_metadata);
    } catch (e) {
      curJsonMeta = {};
    }

    const newProfile = {
      name,
      about,
      cover_image: coverImage,
      profile_image: profileImage,
      website,
      location
    };

    const newJsonMeta = Object.assign({}, curJsonMeta, { profile: newProfile });

    this.setState({ inProgress: true });
    return updateProfile(activeAccount, pin, newJsonMeta)
      .then(r => {
        message.success(
          intl.formatMessage({
            id: 'profile-edit.updated'
          })
        );

        setTimeout(() => {
          const { onUpdate } = this.props;
          onUpdate();
        }, 400);

        return r;
      })
      .catch(err => {
        message.error(formatChainError(err));
      })
      .finally(() => {
        this.setState({ inProgress: false });
      });
  };

  render() {
    const {
      name,
      about,
      website,
      location,
      coverImage,
      profileImage,
      inProgress
    } = this.state;

    return (
      <div className="profile-edit-dialog">
        <div className="profile-edit-form">
          <div className="form-item">
            <div className="form-label">
              <FormattedMessage id="profile-edit.name" />
            </div>
            <div className="form-input">
              <Input
                value={name}
                maxLength={30}
                onChange={this.valueChanged}
                data-var="name"
              />
            </div>
          </div>
          <div className="form-item">
            <div className="form-label">
              <FormattedMessage id="profile-edit.about" />
            </div>
            <div className="form-input">
              <Input
                value={about}
                maxLength={160}
                onChange={this.valueChanged}
                data-var="about"
              />
            </div>
          </div>
          <div className="form-item">
            <div className="form-label">
              <FormattedMessage id="profile-edit.profile-image" />
            </div>
            <div className="form-input">
              <Input
                placeholder="https://"
                value={profileImage}
                maxLength={500}
                onChange={this.valueChanged}
                data-var="profileImage"
              />
              <UploadIcon
                {...this.props}
                onBegin={() => {
                  this.setState({ inProgress: true });
                }}
                onEnd={url => {
                  this.setState({ profileImage: url, inProgress: false });
                }}
              />
            </div>
          </div>
          <div className="form-item">
            <div className="form-label">
              <FormattedMessage id="profile-edit.cover-image" />
            </div>
            <div className="form-input">
              <Input
                placeholder="https://"
                value={coverImage}
                maxLength={500}
                onChange={this.valueChanged}
                data-var="coverImage"
              />
              <UploadIcon
                {...this.props}
                onBegin={() => {
                  this.setState({ inProgress: true });
                }}
                onEnd={url => {
                  this.setState({ coverImage: url, inProgress: false });
                }}
              />
            </div>
          </div>
          <div className="form-item">
            <div className="form-label">
              <FormattedMessage id="profile-edit.website" />
            </div>
            <div className="form-input">
              <Input
                placeholder="https://"
                value={website}
                maxLength={100}
                onChange={this.valueChanged}
                data-var="website"
              />
            </div>
          </div>
          <div className="form-item">
            <div className="form-label">
              <FormattedMessage id="profile-edit.location" />
            </div>
            <div className="form-input">
              <Input
                value={location}
                maxLength={30}
                onChange={this.valueChanged}
                data-var="location"
              />
            </div>
          </div>
          <div className="form-item">
            <div className="form-input">
              <PinRequired {...this.props} onSuccess={this.save}>
                <Button size="large" type="primary" disabled={inProgress}>
                  <FormattedMessage id="g.save" />
                </Button>
              </PinRequired>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ProfileEdit.propTypes = {
  intl: PropTypes.instanceOf(Object).isRequired,
  activeAccount: PropTypes.instanceOf(Object).isRequired,
  account: PropTypes.instanceOf(Object).isRequired,
  onUpdate: PropTypes.func.isRequired
};

class ProfileEditModal extends PureComponent {
  render() {
    const { intl, visible, onCancel } = this.props;

    return (
      <Modal
        visible={visible}
        footer={false}
        width="550px"
        onCancel={onCancel}
        destroyOnClose
        centered
        title={intl.formatMessage({ id: 'profile-edit.title' })}
      >
        <ProfileEdit {...this.props} />
      </Modal>
    );
  }
}

ProfileEditModal.defaultProps = {
  onCancel: () => {},
  onUpdate: () => {}
};

ProfileEditModal.propTypes = {
  intl: PropTypes.instanceOf(Object).isRequired,
  account: PropTypes.instanceOf(Object).isRequired,
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func,
  onUpdate: PropTypes.func
};

export default ProfileEditModal;
