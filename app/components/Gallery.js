/*
eslint-disable react/no-multi-comp, no-underscore-dangle
*/

import React, {Component} from 'react';
import {Modal, Popconfirm, Tooltip, message} from 'antd';

import {injectIntl} from 'react-intl';

import PropTypes from "prop-types";
import {getImages, removeImage} from '../backend/esteem-client';


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
    this.setState({data: [], loading: false});

    const {activeAccount} = this.props;

    getImages(activeAccount.username).then(data => {
      this.setState({data});
      return data;
    }).catch(() => {

    }).finally(() => {
      this.setState({loading: false});
    })
  };

  copy = (item) => {
    const {intl} = this.props;

    const i = document.createElement('input');
    i.setAttribute('type', 'text');
    i.value = item.url;
    document.body.appendChild(i);
    i.select();
    document.execCommand('Copy');
    document.body.removeChild(i);
    message.success(intl.formatMessage({id: 'gallery.copied'}))
  };

  delete = (item) => {
    const {activeAccount} = this.props;
    removeImage(item._id, activeAccount.username).then(resp => {
      const {data} = this.state;
      const newData = [...data].filter(x => x._id !== item._id);
      this.setState({data: newData});
      return resp;
    }).catch(() => {

    })
  };


  render() {
    const {intl} = this.props;
    const {data, loading} = this.state;

    return (
      <div className="gallery-dialog-content">
        {data.length > 0 &&
        <div className="gallery-list">
          <div className="gallery-list-body">
            {data.map((item) => (
              <div className="gallery-list-item" style={{backgroundImage: `url('${item.url}')`}}>
                <div className="item-inner" role="none" onClick={() => {
                  this.copy(item)
                }}/>
                <div className="item-controls">
                  <Popconfirm title={intl.formatMessage({id: 'g.are-you-sure'})}
                              okText={intl.formatMessage({id: 'g.ok'})}
                              cancelText={intl.formatMessage({id: 'g.cancel'})} onConfirm={() => {
                    this.delete(item);
                  }}>
                    <Tooltip title={intl.formatMessage({id: 'g.delete'})} mouseEnterDelay={2}>
                      <span className="btn-delete"><i className="mi">delete_forever</i></span>
                    </Tooltip>
                  </Popconfirm>
                </div>
              </div>
            ))}
          </div>
        </div>
        }

        {!loading && data.length < 1 &&
        <span>Nothing here</span>
        }
      </div>
    )
  }
}

Gallery.propTypes = {
  activeAccount: PropTypes.instanceOf(Object).isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};


class GalleryModal extends Component {

  render() {

    const {visible, onCancel, intl} = this.props;

    return <Modal
      visible={visible}
      footer={false}
      width="890px"
      onCancel={onCancel}
      destroyOnClose
      centered
      title={intl.formatMessage({id: 'gallery.title'})}
    >
      <Gallery {...this.props} />
    </Modal>
  }
}

GalleryModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  intl: PropTypes.instanceOf(Object).isRequired
};


export default injectIntl(GalleryModal)