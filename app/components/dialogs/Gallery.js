/*
eslint-disable react/no-multi-comp, no-underscore-dangle
*/

import React, { Component } from 'react';
import { Modal, Popconfirm, message } from 'antd';

import { FormattedMessage } from 'react-intl';

import PropTypes from 'prop-types';

import Tooltip from '../common/Tooltip';

import LinearProgress from '../common/LinearProgress';

import { getImages, removeImage } from '../../backend/esteem-client';

class Gallery extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      loading: true
    };
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    this.setState({ data: [], loading: true });

    const { activeAccount, intl } = this.props;

    return getImages(activeAccount.username)
      .then(data => {
        this.setState({ data: this.sortData(data) });
        return data;
      })
      .catch(() => {
        message.error(intl.formatMessage({ id: 'gallery.load-error' }));
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  sortData = data =>
    data.sort((a, b) => {
      const dateA = new Date(a.created).getTime();
      const dateB = new Date(b.created).getTime();

      return dateB > dateA ? 1 : -1;
    });

  itemClicked = item => {
    const { intl, onSelect } = this.props;

    if (onSelect) {
      onSelect(item.url);
      return;
    }

    const i = document.createElement('input');
    i.setAttribute('type', 'text');
    i.value = item.url;
    document.body.appendChild(i);
    i.select();
    document.execCommand('Copy');
    document.body.removeChild(i);
    message.success(intl.formatMessage({ id: 'gallery.copied' }));
  };

  delete = item => {
    const { activeAccount } = this.props;
    removeImage(item._id, activeAccount.username)
      .then(resp => {
        const { data } = this.state;
        const newData = [...data].filter(x => x._id !== item._id);
        this.setState({ data: this.sortData(newData) });
        return resp;
      })
      .catch(() => {});
  };

  render() {
    const { intl } = this.props;
    const { data, loading } = this.state;

    return (
      <div className="gallery-dialog-content">
        {loading && <LinearProgress />}
        {data.length > 0 && (
          <div className="gallery-list">
            <div className="gallery-list-body">
              {data.map(item => (
                <div
                  className="gallery-list-item"
                  style={{ backgroundImage: `url('${item.url}')` }}
                  key={item._id}
                >
                  <div
                    className="item-inner"
                    role="none"
                    onClick={() => {
                      this.itemClicked(item);
                    }}
                  />
                  <div className="item-controls">
                    <Popconfirm
                      title={intl.formatMessage({ id: 'g.are-you-sure' })}
                      okText={intl.formatMessage({ id: 'g.ok' })}
                      cancelText={intl.formatMessage({ id: 'g.cancel' })}
                      onConfirm={() => {
                        this.delete(item);
                      }}
                    >
                      <Tooltip
                        title={intl.formatMessage({ id: 'g.delete' })}
                        mouseEnterDelay={2}
                      >
                        <span className="btn-delete">
                          <i className="mi">delete_forever</i>
                        </span>
                      </Tooltip>
                    </Popconfirm>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && data.length < 1 && (
          <div className="gallery-list">
            <FormattedMessage id="gallery.empty-list" />
          </div>
        )}
      </div>
    );
  }
}

Gallery.defaultProps = {
  onSelect: null
};

Gallery.propTypes = {
  onSelect: PropTypes.func,
  activeAccount: PropTypes.instanceOf(Object).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

class GalleryModal extends Component {
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
        title={intl.formatMessage({ id: 'gallery.title' })}
      >
        <Gallery {...this.props} />
      </Modal>
    );
  }
}

GalleryModal.defaultProps = {
  onSelect: null
};

GalleryModal.propTypes = {
  onSelect: PropTypes.func,
  onCancel: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};

export default GalleryModal;
