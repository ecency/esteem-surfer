import React, { Component, Fragment } from 'react';
import { Button, Progress } from 'antd';
import { FormattedMessage } from 'react-intl';
import { ipcRenderer } from 'electron';

class Updater extends Component {
  constructor(props) {
    super(props);

    this.state = {
      flag: false,
      ver: null,
      downloading: false,
      progress: 0,
      completed: false
    };
  }

  componentDidMount() {
    ipcRenderer.on('update-available', this.onUpdateAvailable);
    ipcRenderer.on('download-started', this.onDownloadStarted);
    ipcRenderer.on('download-progress', this.onDownloadProgress);
    ipcRenderer.on('update-downloaded', this.onUpdateDownloaded);
  }

  onUpdateAvailable = (event, ver) => {
    this.setState({
      flag: true,
      ver
    });
  };

  onDownloadStarted = () => {
    this.setState({
      downloading: true,
      progress: 0
    });
  };

  onDownloadProgress = (event, perc) => {
    this.setState({
      progress: perc
    });
  };

  onUpdateDownloaded = () => {
    this.setState({
      downloading: false,
      completed: true
    });
  };

  begin = () => {
    ipcRenderer.send('download-update');
  };

  dismiss = () => {
    // Basically reset state
    this.setState({
      flag: false,
      ver: null,
      downloading: false,
      progress: 0,
      completed: false
    });
  };

  updateRestart = () => {
    ipcRenderer.send('update-restart');
  };

  render() {
    const { flag, ver, downloading, progress, completed } = this.state;

    if (!flag) {
      return null;
    }

    return (
      <div className="updater-alert">
        {!downloading && !completed && (
          <Fragment>
            <p className="info-text">
              <FormattedMessage id="updater.new-version-available" />
              <span className="release-name">{ver}</span>
            </p>
            <Button type="primary" className="btn-update" onClick={this.begin}>
              <FormattedMessage id="updater.update" />
            </Button>

            <Button className="btn-dismiss" onClick={this.dismiss}>
              <FormattedMessage id="updater.dismiss" />
            </Button>
          </Fragment>
        )}

        {downloading && (
          <Fragment>
            <p className="info-text">
              <FormattedMessage id="updater.downloading" />
            </p>
            <div className="progress">
              <Progress percent={parseInt(progress, 10)} />
            </div>
          </Fragment>
        )}
        {completed && (
          <Fragment>
            <p className="info-text">
              <FormattedMessage id="updater.download-completed" />
            </p>
            <Button type="primary" onClick={this.updateRestart}>
              <FormattedMessage id="updater.restart" />
            </Button>
          </Fragment>
        )}
      </div>
    );
  }
}

export default Updater;
